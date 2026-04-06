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

// ─── Lecture sondage + options (admin) ──────────────────────────────────────

export async function getPollWithOptions(pollId: string) {
  const auth = await requireAdmin()
  if (isError(auth)) return { success: false as const, error: 'NOT_ADMIN' }
  const { supabase } = auth

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select(`
      id, question, description, status, proposer_name, expires_at, total_votes,
      options ( id, text, order_index, votes_count ),
      poll_tags ( tag_id )
    `)
    .eq('id', pollId)
    .single()

  if (pollError || !poll) {
    return { success: false as const, error: pollError?.message ?? 'Sondage introuvable' }
  }

  const options = (poll.options as { id: string; text: string; order_index: number; votes_count: number }[])
    .sort((a, b) => a.order_index - b.order_index)

  const selectedTagIds = (poll.poll_tags as { tag_id: string }[]).map((pt) => pt.tag_id)

  // Règle métier : éditable seulement si aucun vote ET pas archivé
  const isEditable = poll.total_votes === 0 && poll.status !== 'archived'

  return {
    success: true as const,
    data: {
      poll: {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        status: poll.status as 'pending' | 'active' | 'archived',
        proposer_name: poll.proposer_name,
        expires_at: poll.expires_at,
        total_votes: poll.total_votes as number,
      },
      options,
      selectedTagIds,
      isEditable,
    },
  }
}

// ─── Mise à jour options (upsert + delete supprimées) ──────────────────────

export async function updatePollOptions(
  pollId: string,
  options: { id?: string; text: string; order_index: number }[]
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (isError(auth)) return auth
  const { supabase } = auth

  // Sécurité serveur : vérifier qu'aucun vote n'existe avant de modifier les options
  const { data: pollCheck } = await supabase
    .from('polls')
    .select('total_votes, status')
    .eq('id', pollId)
    .single()

  if (!pollCheck) return { success: false, error: 'Sondage introuvable' }
  if (pollCheck.total_votes > 0 || pollCheck.status === 'archived') {
    return { success: false, error: 'Ce sondage ne peut plus être modifié', code: 'NOT_EDITABLE' }
  }

  // Récupérer les options existantes pour identifier celles à supprimer
  const { data: existingOptions } = await supabase
    .from('options')
    .select('id')
    .eq('poll_id', pollId)

  const existingIds = new Set((existingOptions ?? []).map((o) => o.id))
  const keptIds = new Set(options.filter((o) => o.id).map((o) => o.id!))

  // Supprimer les options qui ne sont plus dans la liste
  const toDelete = [...existingIds].filter((id) => !keptIds.has(id))
  if (toDelete.length > 0) {
    const { error } = await supabase
      .from('options')
      .delete()
      .in('id', toDelete)
    if (error) return { success: false, error: error.message }
  }

  // Upsert les options existantes (mise à jour texte/ordre) et insérer les nouvelles
  for (const opt of options) {
    if (opt.id && existingIds.has(opt.id)) {
      const { error } = await supabase
        .from('options')
        .update({ text: opt.text, order_index: opt.order_index })
        .eq('id', opt.id)
      if (error) return { success: false, error: error.message }
    } else {
      const { error } = await supabase
        .from('options')
        .insert({ poll_id: pollId, text: opt.text, order_index: opt.order_index })
      if (error) return { success: false, error: error.message }
    }
  }

  revalidatePath(`/admin/polls/${pollId}`)
  revalidatePath('/admin')

  return { success: true }
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
