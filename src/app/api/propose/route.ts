import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { MAX_PENDING_PROPOSALS } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, proposer_name, options, tag_ids } = body

    // Vérification rate limit : max MAX_PENDING_PROPOSALS propositions pending par user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { count, error: countError } = await supabaseAdmin
        .from('polls')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending')

      if (countError) {
        return NextResponse.json(
          { error: 'Erreur lors de la vérification des propositions' },
          { status: 500 }
        )
      }

      if ((count ?? 0) >= MAX_PENDING_PROPOSALS) {
        return NextResponse.json(
          {
            error: "Tu as atteint la limite de 3 propositions en attente de modération. Merci de patienter qu'elles soient traitées avant d'en proposer de nouvelles.",
            code: 'RATE_LIMIT_EXCEEDED',
          },
          { status: 429 }
        )
      }
    }

    // Validation minimale
    if (!question || question.length < 10) {
      return NextResponse.json(
        { error: 'Question trop courte' },
        { status: 400 }
      )
    }
    if (!options || options.length < 2) {
      return NextResponse.json(
        { error: 'Minimum 2 options' },
        { status: 400 }
      )
    }

    // Insérer le sondage (service role — bypass RLS)
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .insert({
        question,
        proposer_name: proposer_name || null,
        status: 'pending',
        user_id: user?.id ?? null,
      })
      .select('id')
      .single()

    if (pollError || !poll) {
      return NextResponse.json(
        { error: pollError?.message ?? 'Erreur création' },
        { status: 500 }
      )
    }

    // Insérer les options
    const optionsInsert = options
      .filter((o: string) => o.trim())
      .map((text: string, i: number) => ({
        poll_id: poll.id,
        text,
        order_index: i,
      }))

    const { error: optError } = await supabaseAdmin
      .from('options')
      .insert(optionsInsert)

    if (optError) {
      return NextResponse.json(
        { error: optError.message },
        { status: 500 }
      )
    }

    // Insérer les tags si présents
    if (tag_ids && tag_ids.length > 0) {
      await supabaseAdmin
        .from('poll_tags')
        .insert(tag_ids.map((tag_id: string) => ({
          poll_id: poll.id,
          tag_id,
        })))
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('API propose error:', err)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
