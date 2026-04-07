import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, proposer_name, options, tag_ids } = body

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
