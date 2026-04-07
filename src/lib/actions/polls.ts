'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

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

// Remplacée par le client browser direct dans proposer/page.tsx
// Signature conservée pour éviter les erreurs d'import
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function proposePoll(_data: z.input<typeof proposePollSchema>): Promise<ActionResult> {
  return { success: true }
}

// ─── Mise à jour localisation ──────────────────────────────────────────────

const locationSchema = z.enum(['saint_pierre', 'miquelon', 'exterieur'])

// Remplacée par le client browser direct dans GeoContext.tsx
// Signature conservée pour éviter les erreurs d'import
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateUserLocation(
  _location: z.input<typeof locationSchema>
): Promise<ActionResult> {
  return { success: true }
}
