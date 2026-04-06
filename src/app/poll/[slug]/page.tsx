import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PollDetailClient from '@/components/pages/PollDetailClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: poll } = await supabase
    .from('polls')
    .select('question')
    .eq('slug', slug)
    .single()

  return {
    title: poll ? `${poll.question} — VoxSPM` : 'Sondage — VoxSPM',
  }
}

export default async function PollPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch le sondage + options + tags en une requête
  const { data: poll } = await supabase
    .from('polls')
    .select(`
      id, slug, question, description, total_votes, proposed_at, proposer_name,
      votes_sp, votes_miq, votes_ext,
      options ( id, text, votes_count, order_index ),
      poll_tags ( tag_id, tags ( id, name, slug, color, icon ) )
    `)
    .eq('slug', slug)
    .single()

  if (!poll) notFound()

  // Aplatir la structure tags depuis poll_tags → tags
  // Supabase retourne tags comme objet ou tableau selon la relation — on normalise
  const tags = (poll.poll_tags as { tag_id: string; tags: unknown }[])
    .map((pt) => pt.tags as { id: string; name: string; slug: string; color: string; icon: string } | null)
    .filter((t): t is { id: string; name: string; slug: string; color: string; icon: string } => t !== null)

  const options = (poll.options as { id: string; text: string; votes_count: number; order_index: number }[])
    .sort((a, b) => a.order_index - b.order_index)

  return (
    <PollDetailClient
      poll={{
        id: poll.id,
        slug: poll.slug,
        question: poll.question,
        description: poll.description,
        total_votes: poll.total_votes,
        proposed_at: poll.proposed_at,
        proposer_name: poll.proposer_name,
        votes_sp: poll.votes_sp,
        votes_miq: poll.votes_miq,
        votes_ext: poll.votes_ext,
      }}
      initialOptions={options}
      tags={tags}
    />
  )
}
