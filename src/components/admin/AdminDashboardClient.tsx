'use client'

import { useMemo } from 'react'
import StatsCards from '@/components/admin/StatsCards'
import PollsTable from '@/components/admin/PollsTable'
import { useLiveAdminPolls, type AdminPoll, type AdminTag } from '@/lib/hooks/useLiveAdminPolls'

interface AdminDashboardClientProps {
  initialPolls: AdminPoll[]
  initialTags: AdminTag[]
}

export default function AdminDashboardClient({ initialPolls, initialTags }: AdminDashboardClientProps) {
  const { polls, newPollIds } = useLiveAdminPolls(initialPolls, initialTags)

  const stats = useMemo(() => {
    const activeCount = polls.filter((p) => p.status === 'active').length
    const pendingCount = polls.filter((p) => p.status === 'pending').length
    const archivedCount = polls.filter((p) => p.status === 'archived').length
    const totalVotes = polls.reduce((sum, p) => sum + p.total_votes, 0)
    const votes_sp = polls.reduce((sum, p) => sum + p.votes_sp, 0)
    const votes_miq = polls.reduce((sum, p) => sum + p.votes_miq, 0)
    const votes_ext = polls.reduce((sum, p) => sum + p.votes_ext, 0)
    return { activeCount, pendingCount, archivedCount, totalVotes, votes_sp, votes_miq, votes_ext }
  }, [polls])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
      <StatsCards {...stats} />
      <h2 className="text-lg font-semibold text-foreground">Sondages</h2>
      <PollsTable polls={polls} newPollIds={newPollIds} />
    </div>
  )
}
