import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'
import type { AdminPoll, AdminTag } from '@/lib/hooks/useLiveAdminPolls'

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
    .select('id, name, slug, color, icon')
    .order('order_index')

  const tagMap = new Map<string, AdminTag>((allTags ?? []).map((t) => [t.id, t as AdminTag]))

  const polls: AdminPoll[] = (rawPolls ?? []).map((poll) => ({
    id: poll.id,
    slug: poll.slug,
    question: poll.question,
    status: poll.status as 'pending' | 'active' | 'archived',
    total_votes: poll.total_votes,
    proposed_at: poll.proposed_at,
    proposer_name: poll.proposer_name,
    votes_sp: poll.votes_sp,
    votes_miq: poll.votes_miq,
    votes_ext: poll.votes_ext,
    tags: (poll.poll_tags as { tag_id: string }[])
      .map((pt) => tagMap.get(pt.tag_id))
      .filter((t): t is AdminTag => t !== undefined),
  }))

  const initialTags: AdminTag[] = (allTags ?? []).map((t) => t as AdminTag)

  return (
    <AdminDashboardClient initialPolls={polls} initialTags={initialTags} />
  )
}
