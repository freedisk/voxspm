'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string; code?: string }

// ─── Vote ──────────────────────────────────────────────────────────────────

export async function vote(pollId: string, optionId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Non authentifié', code: 'NOT_AUTHENTICATED' }
  }

  // Vérifier que l'user a bien choisi sa localisation
  const { data: profile } = await supabase
    .from('profiles')
    .select('location')
    .eq('id', user.id)
    .single()

  if (!profile?.location) {
    return { success: false, error: 'Localisation requise', code: 'LOCATION_REQUIRED' }
  }

  // Vérifier que le sondage est actif (RLS filtre déjà, mais on veut un message clair)
  const { data: poll } = await supabase
    .from('polls')
    .select('id, status')
    .eq('id', pollId)
    .single()

  if (!poll) {
    return { success: false, error: 'Sondage introuvable ou inactif', code: 'POLL_INACTIVE' }
  }

  // Vérifier que l'option appartient au sondage
  const { data: option } = await supabase
    .from('options')
    .select('id')
    .eq('id', optionId)
    .eq('poll_id', pollId)
    .single()

  if (!option) {
    return { success: false, error: 'Option invalide', code: 'INVALID_OPTION' }
  }

  // INSERT vote — le trigger DB met à jour les compteurs dénormalisés
  // On catch le code 23505 (unique violation) plutôt que de vérifier en amont
  // pour éviter la race condition entre le check et l'insert
  const { error } = await supabase
    .from('votes')
    .insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: user.id,
      location: profile.location,
    })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Vous avez déjà voté', code: 'ALREADY_VOTED' }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ─── Proposition de sondage ────────────────────────────────────────────────

const proposePollSchema = z.object({
  question: z.string().min(10, 'La question doit faire au moins 10 caractères').max(300, 'La question ne doit pas dépasser 300 caractères'),
  proposerName: z.string().max(50).optional().transform((v) => v || null),
  options: z
    .array(z.string().min(1, 'Option vide').max(200, 'Option trop longue'))
    .min(2, 'Il faut au moins 2 options')
    .max(6, 'Maximum 6 options'),
  tagIds: z.array(z.string().uuid()).max(3, 'Maximum 3 tags').optional(),
})

export async function proposePoll(data: z.input<typeof proposePollSchema>): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Non authentifié', code: 'NOT_AUTHENTICATED' }
  }

  const parsed = proposePollSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { question, proposerName, options, tagIds } = parsed.data

  // Rate limit : max 3 sondages pending par utilisateur
  // Empêche le spam de propositions sans pénaliser les utilisateurs actifs
  const { count } = await supabase
    .from('polls')
    .select('*', { count: 'exact', head: true })
    .eq('proposed_by', user.id)
    .eq('status', 'pending')

  if (count !== null && count >= 3) {
    return { success: false, error: 'Vous avez déjà 3 propositions en attente', code: 'RATE_LIMITED' }
  }

  // INSERT poll — le slug est généré par le trigger DB, pas ici
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({
      question,
      proposer_name: proposerName,
      proposed_by: user.id,
      status: 'pending',
    })
    .select('id')
    .single()

  if (pollError || !poll) {
    return { success: false, error: pollError?.message ?? 'Erreur création sondage' }
  }

  // INSERT options avec order_index pour préserver l'ordre saisi
  const optionsInsert = options.map((text, index) => ({
    poll_id: poll.id,
    text,
    order_index: index,
  }))

  const { error: optionsError } = await supabase
    .from('options')
    .insert(optionsInsert)

  if (optionsError) {
    return { success: false, error: optionsError.message }
  }

  // INSERT poll_tags si des tags ont été sélectionnés
  if (tagIds && tagIds.length > 0) {
    const tagsInsert = tagIds.map((tagId) => ({
      poll_id: poll.id,
      tag_id: tagId,
    }))

    const { error: tagsError } = await supabase
      .from('poll_tags')
      .insert(tagsInsert)

    if (tagsError) {
      return { success: false, error: tagsError.message }
    }
  }

  revalidatePath('/')

  return { success: true }
}

// ─── Mise à jour localisation ──────────────────────────────────────────────

const locationSchema = z.enum(['saint_pierre', 'miquelon', 'exterieur'])

export async function updateUserLocation(
  location: z.input<typeof locationSchema>
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Non authentifié', code: 'NOT_AUTHENTICATED' }
  }

  const parsed = locationSchema.safeParse(location)
  if (!parsed.success) {
    return { success: false, error: 'Localisation invalide' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ location: parsed.data })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
