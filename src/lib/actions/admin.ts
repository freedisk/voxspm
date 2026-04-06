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
