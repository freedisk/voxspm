import { createClient } from '@/lib/supabase/server'
import PollCard from '@/components/polls/PollCard'
import HomeClient from '@/components/pages/HomeClient'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

interface PollWithTags {
  id: string
  slug: string
  question: string
  total_votes: number
  proposed_at: string
  proposer_name: string | null
  votes_sp: number
  votes_miq: number
  votes_ext: number
  tags: Tag[]
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[] }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  // Récupérer tous les tags pour le filtre
  const { data: allTags } = await supabase
    .from('tags')
    .select('*')
    .order('order_index')

  // Normaliser les tags actifs depuis les query params
  const rawTag = params.tag
  const activeTagSlugs: string[] = Array.isArray(rawTag)
    ? rawTag
    : rawTag
      ? [rawTag]
      : []

  // Récupérer les sondages actifs avec leurs tags via la jointure
  const { data: rawPolls } = await supabase
    .from('polls')
    .select(`
      id, slug, question, total_votes, proposed_at, proposer_name,
      votes_sp, votes_miq, votes_ext,
      poll_tags ( tag_id )
    `)
    .eq('status', 'active')
    .order('proposed_at', { ascending: false })
    .limit(50)

  // Assembler les tags complets sur chaque sondage
  const tagMap = new Map((allTags ?? []).map((t) => [t.id, t]))

  let polls: PollWithTags[] = (rawPolls ?? []).map((poll) => ({
    ...poll,
    tags: (poll.poll_tags as { tag_id: string }[])
      .map((pt) => tagMap.get(pt.tag_id))
      .filter((t): t is Tag => t !== undefined),
  }))

  // Filtrer côté serveur par tags actifs
  if (activeTagSlugs.length > 0) {
    polls = polls.filter((poll) =>
      poll.tags.some((tag) => activeTagSlugs.includes(tag.slug))
    )
  }

  return (
    <div>
      <HomeClient
        tags={allTags ?? []}
        activeTagSlugs={activeTagSlugs}
      />

      {polls.length === 0 ? (
        <p className="text-center text-muted py-12">
          Aucun sondage en cours — revenez bientôt !
        </p>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              slug={poll.slug}
              question={poll.question}
              total_votes={poll.total_votes}
              proposed_at={poll.proposed_at}
              proposer_name={poll.proposer_name}
              tags={poll.tags}
              votes_sp={poll.votes_sp}
              votes_miq={poll.votes_miq}
              votes_ext={poll.votes_ext}
            />
          ))}
        </div>
      )}
    </div>
  )
}
