import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PollCardLive from '@/components/polls/PollCardLive'
import HomeClient from '@/components/pages/HomeClient'
import Hero from '@/components/layout/Hero'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
  order_index: number
  active_polls_count: number
}

interface PollOption {
  id: string
  text: string
  votes_count: number
  order_index: number
}

interface PollWithData {
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
  options: PollOption[]
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[] }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  // Récupération des tags et du comptage des sondages actifs par tag en parallèle
  const [{ data: rawTagsData }, { data: tagCountsData }] = await Promise.all([
    supabase.from('tags').select('*').order('order_index'),
    supabase
      .from('poll_tags')
      .select('tag_id, polls!inner(status)')
      .eq('polls.status', 'active'),
  ])

  // Agrégation : combien de sondages actifs par tag_id
  const tagCountsMap: Record<string, number> = {}
  for (const row of (tagCountsData ?? [])) {
    const tagId = (row as { tag_id: string }).tag_id
    tagCountsMap[tagId] = (tagCountsMap[tagId] ?? 0) + 1
  }

  // Enrichissement + tri : décroissant par sondages actifs, puis order_index, puis nom FR
  const allTags: Tag[] = (rawTagsData ?? [])
    .map((tag) => ({ ...tag, active_polls_count: tagCountsMap[tag.id] ?? 0 }))
    .sort(
      (a, b) =>
        (b.active_polls_count - a.active_polls_count) ||
        (a.order_index - b.order_index) ||
        a.name.localeCompare(b.name, 'fr')
    )

  const rawTag = params.tag
  const activeTagSlugs: string[] = Array.isArray(rawTag)
    ? rawTag
    : rawTag
      ? [rawTag]
      : []

  // Enrichi : inclut options pour afficher les résultats dans PollCard
  const { data: rawPolls } = await supabase
    .from('polls')
    .select(`
      id, slug, question, total_votes, proposed_at, proposer_name,
      votes_sp, votes_miq, votes_ext,
      poll_tags ( tag_id ),
      options ( id, text, votes_count, order_index )
    `)
    .eq('status', 'active')
    .order('proposed_at', { ascending: false })
    .limit(50)

  const tagMap = new Map(allTags.map((t) => [t.id, t]))

  let polls: PollWithData[] = (rawPolls ?? []).map((poll) => ({
    ...poll,
    tags: (poll.poll_tags as { tag_id: string }[])
      .map((pt) => tagMap.get(pt.tag_id))
      .filter((t): t is Tag => t !== undefined),
    options: (poll.options as PollOption[]) ?? [],
  }))

  if (activeTagSlugs.length > 0) {
    polls = polls.filter((poll) =>
      poll.tags.some((tag) => activeTagSlugs.includes(tag.slug))
    )
  }

  const totalVotes = polls.reduce((sum, p) => sum + p.total_votes, 0)
  const activePolls = polls.length

  const { count: completedPolls } = await supabase
    .from('polls')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'archived')

  return (
    <div>
      <Hero
        activePolls={activePolls}
        totalVotes={totalVotes}
        completedPolls={(completedPolls ?? 0) + activePolls}
      />

      <div id="sondages" className="pt-8">
        <HomeClient
          tags={allTags}
          activeTagSlugs={activeTagSlugs}
        />

        {polls.length === 0 ? (
          <p
            className="text-center py-16 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Aucun sondage en cours — revenez bientôt !
          </p>
        ) : (
          // 🎨 Intent: grille 3 cols desktop / 2 cols tablette / 1 col mobile, max-w-6xl
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 max-w-6xl mx-auto px-4">
            {polls.map((poll) => (
              <PollCardLive
                key={poll.id}
                id={poll.id}
                slug={poll.slug}
                question={poll.question}
                total_votes={poll.total_votes}
                proposed_at={poll.proposed_at}
                proposer_name={poll.proposer_name}
                tags={poll.tags}
                options={poll.options}
                votes_sp={poll.votes_sp}
                votes_miq={poll.votes_miq}
                votes_ext={poll.votes_ext}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB mobile */}
      <Link
        href="/proposer"
        className="
          fixed bottom-6 left-1/2 -translate-x-1/2 z-50
          md:hidden
          min-h-[44px] px-6 py-3
          rounded-[var(--radius-pill)]
          text-sm font-medium text-white
          transition-all duration-200
          active:scale-95
        "
        style={{
          background: 'var(--text-primary)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        ✦ Proposer un sondage
      </Link>
    </div>
  )
}
