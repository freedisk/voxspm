import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET /api/admin/export
// Protégé par le middleware admin sur /api/admin/** — pas de check auth ici.
export async function GET() {
  const [pollsResult, votesResult, statusResult] = await Promise.all([
    supabaseAdmin
      .from('polls')
      .select(`
        id, slug, question, status, proposer_name, proposed_at, validated_at,
        total_votes, votes_sp, votes_miq, votes_ext,
        options ( id, text, order_index, votes_count ),
        poll_tags ( tags ( slug, name, icon ) )
      `)
      .order('proposed_at', { ascending: false }),

    supabaseAdmin
      .from('votes')
      .select('poll_id, option_id, location, created_at')
      .order('created_at', { ascending: true }),

    // Une seule requête, comptage en mémoire (évite 3 requêtes séparées par statut)
    supabaseAdmin
      .from('polls')
      .select('status'),
  ])

  if (pollsResult.error) {
    return NextResponse.json({ error: 'Erreur récupération sondages' }, { status: 500 })
  }
  if (votesResult.error) {
    return NextResponse.json({ error: 'Erreur récupération votes' }, { status: 500 })
  }
  if (statusResult.error) {
    return NextResponse.json({ error: 'Erreur récupération statuts' }, { status: 500 })
  }

  const polls = pollsResult.data ?? []
  const votes = votesResult.data ?? []
  const allStatuses = statusResult.data ?? []

  // Comptage des statuts en mémoire
  const statusCounts = allStatuses.reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Agrégats depuis les compteurs dénormalisés (source de vérité = colonnes polls)
  const totalVotes = polls.reduce((sum, p) => sum + (p.total_votes ?? 0), 0)
  const votesSp = polls.reduce((sum, p) => sum + (p.votes_sp ?? 0), 0)
  const votesMiq = polls.reduce((sum, p) => sum + (p.votes_miq ?? 0), 0)
  const votesExt = polls.reduce((sum, p) => sum + (p.votes_ext ?? 0), 0)

  type OptionRow = { id: string; text: string; order_index: number; votes_count: number }
  type TagRow = { slug: string; name: string; icon: string }
  type PollTagRow = { tags: TagRow | TagRow[] | null }

  const serializedPolls = polls.map((poll) => ({
    id: poll.id,
    slug: poll.slug,
    question: poll.question,
    status: poll.status,
    proposer_name: poll.proposer_name,
    proposed_at: poll.proposed_at,
    validated_at: poll.validated_at,
    total_votes: poll.total_votes,
    votes_sp: poll.votes_sp,
    votes_miq: poll.votes_miq,
    votes_ext: poll.votes_ext,
    options: ((poll.options as OptionRow[]) ?? [])
      .slice()
      .sort((a, b) => a.order_index - b.order_index),
    tags: ((poll.poll_tags as PollTagRow[]) ?? []).flatMap((pt) =>
      Array.isArray(pt.tags) ? pt.tags : pt.tags ? [pt.tags] : []
    ),
  }))

  const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD UTC

  const snapshot = {
    exported_at: new Date().toISOString(),
    exported_by: 'admin',
    version: 1,
    stats_global: {
      total_polls: polls.length,
      total_votes: totalVotes,
      total_proposals_pending: statusCounts['pending'] ?? 0,
      total_proposals_validated: statusCounts['active'] ?? 0,
      total_proposals_archived: statusCounts['archived'] ?? 0,
      votes_by_zone: { sp: votesSp, miq: votesMiq, ext: votesExt },
    },
    polls: serializedPolls,
    votes_detail: votes,
  }

  return NextResponse.json(snapshot, {
    headers: {
      'Content-Disposition': `attachment; filename="voxspm-snapshot-${date}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
