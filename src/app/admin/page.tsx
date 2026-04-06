import { createClient } from '@/lib/supabase/server'
import StatsCards from '@/components/admin/StatsCards'
import PollsTable from '@/components/admin/PollsTable'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch TOUS les sondages (la policy admin_all bypasse le filtre status=active)
  const { data: rawPolls } = await supabase
    .from('polls')
    .select(`
      id, slug, question, status, total_votes, proposed_at, proposer_name,
      votes_sp, votes_miq, votes_ext,
      poll_tags ( tag_id )
    `)
    .order('proposed_at', { ascending: false })

  const { data: allTags } = await supabase
    .from('tags')
    .select('*')
    .order('order_index')

  const tagMap = new Map((allTags ?? []).map((t) => [t.id, t]))
  const polls = (rawPolls ?? []).map((poll) => ({
    ...poll,
    status: poll.status as 'pending' | 'active' | 'archived',
    tags: (poll.poll_tags as { tag_id: string }[])
      .map((pt) => tagMap.get(pt.tag_id))
      .filter((t): t is Tag => t !== undefined),
  }))

  // Stats agrégées
  const activeCount = polls.filter((p) => p.status === 'active').length
  const pendingCount = polls.filter((p) => p.status === 'pending').length
  const archivedCount = polls.filter((p) => p.status === 'archived').length
  const totalVotes = polls.reduce((sum, p) => sum + p.total_votes, 0)
  const votes_sp = polls.reduce((sum, p) => sum + p.votes_sp, 0)
  const votes_miq = polls.reduce((sum, p) => sum + p.votes_miq, 0)
  const votes_ext = polls.reduce((sum, p) => sum + p.votes_ext, 0)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">Dashboard</h1>

      <StatsCards
        activeCount={activeCount}
        pendingCount={pendingCount}
        archivedCount={archivedCount}
        totalVotes={totalVotes}
        votes_sp={votes_sp}
        votes_miq={votes_miq}
        votes_ext={votes_ext}
      />

      <h2 className="text-lg font-semibold text-foreground">Sondages</h2>
      <PollsTable polls={polls} />
    </div>
  )
}
