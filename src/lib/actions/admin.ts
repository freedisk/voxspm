'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string; code?: string }

// Helper : vérifie que l'utilisateur courant est admin
// Centralisé ici car utilisé par toutes les actions de ce fichier
async function requireAdmin(): Promise<
  | { supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | ActionResult
> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Non authentifié', code: 'NOT_AUTHENTICATED' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Accès réservé aux administrateurs', code: 'NOT_ADMIN' }
  }

  return { supabase, userId: user.id }
}

function isError(result: unknown): result is ActionResult {
  return typeof result === 'object' && result !== null && 'success' in result
}

// ─── Gestion des sondages ──────────────────────────────────────────────────

export async function validatePoll(pollId: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (isError(auth)) return auth
  const { supabase, userId } = auth

  const { error } = await supabase
    .from('polls')
    .update({
      status: 'active',
      validated_by: userId,
      validated_at: new Date().toISOString(),
    })
    .eq('id', pollId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin')

  return { success: true }
}

export async function archivePoll(pollId: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (isError(auth)) return auth
  const { supabase } = auth

  const { error } = await supabase
    .from('polls')
    .update({ status: 'archived' })
    .eq('id', pollId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin')

  return { success: true }
}

export async function reactivatePoll(pollId: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (isError(auth)) return auth
  const { supabase } = auth

  const { error } = await supabase
    .from('polls')
    .update({ status: 'active' })
    .eq('id', pollId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin')

  return { success: true }
}

export async function deletePoll(pollId: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (isError(auth)) return auth
  const { supabase } = auth

  // CASCADE supprime automatiquement options, votes, poll_tags
  const { error } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin')

  return { success: true }
}

// ─── Édition complète d'un sondage ─────────────────────────────────────────

interface UpdatePollData {
  question?: string
  proposer_name?: string | null
  status?: 'pending' | 'active' | 'archived'
  expires_at?: string | null
  tagIds?: string[]
  options?: { id?: string; text: string; order_index: number }[]
}

export async function updatePoll(pollId: string, data: UpdatePollData): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (isError(auth)) return auth
  const { supabase, userId } = auth

  // Mettre à jour les champs du sondage
  const pollUpdate: Record<string, unknown> = {}
  if (data.question !== undefined) pollUpdate.question = data.question
  if (data.proposer_name !== undefined) pollUpdate.proposer_name = data.proposer_name
  if (data.expires_at !== undefined) pollUpdate.expires_at = data.expires_at
  if (data.status !== undefined) {
    pollUpdate.status = data.status
    // Si on passe en actif, enregistrer qui a validé
    if (data.status === 'active') {
      pollUpdate.validated_by = userId
      pollUpdate.validated_at = new Date().toISOString()
    }
  }

  if (Object.keys(pollUpdate).length > 0) {
    const { error } = await supabase
      .from('polls')
      .update(pollUpdate)
      .eq('id', pollId)
    if (error) return { success: false, error: error.message }
  }

  // Mettre à jour les tags — supprimer tous puis réinsérer
  // Plus simple et fiable que de faire un diff sur une table de jointure
  if (data.tagIds !== undefined) {
    await supabase.from('poll_tags').delete().eq('poll_id', pollId)
    if (data.tagIds.length > 0) {
      const { error } = await supabase
        .from('poll_tags')
        .insert(data.tagIds.map((tag_id) => ({ poll_id: pollId, tag_id })))
      if (error) return { success: false, error: error.message }
    }
  }

  // Mettre à jour les options — supprimer les anciennes, insérer les nouvelles
  // On ne peut pas modifier votes_count (géré par trigger), donc on ne touche
  // aux options que sur les sondages pending (pas encore de votes)
  if (data.options !== undefined) {
    await supabase.from('options').delete().eq('poll_id', pollId)
    const { error } = await supabase
      .from('options')
      .insert(data.options.map((opt) => ({
        poll_id: pollId,
        text: opt.text,
        order_index: opt.order_index,
      })))
    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath(`/admin/polls/${pollId}`)

  return { success: true }
}

// ─── Gestion des tags ──────────────────────────────────────────────────────

export async function createTag(
  name: string,
  slug: string,
  color: string,
  icon: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (isError(auth)) return auth
  const { supabase } = auth

  // order_index : placer le nouveau tag en dernière position
  const { data: lastTag } = await supabase
    .from('tags')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (lastTag?.order_index ?? 0) + 1

  const { error } = await supabase
    .from('tags')
    .insert({ name, slug, color, icon, order_index: nextOrder })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/tags')

  return { success: true }
}

export async function updateTag(
  tagId: string,
  data: { name?: string; slug?: string; color?: string; icon?: string; order_index?: number }
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (isError(auth)) return auth
  const { supabase } = auth

  const { error } = await supabase
    .from('tags')
    .update(data)
    .eq('id', tagId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/tags')

  return { success: true }
}

export async function deleteTag(tagId: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (isError(auth)) return auth
  const { supabase } = auth

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', tagId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/tags')

  return { success: true }
}
