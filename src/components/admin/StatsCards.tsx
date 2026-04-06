import GeoBreakdown from '@/components/polls/GeoBreakdown'

interface StatsCardsProps {
  activeCount: number
  pendingCount: number
  archivedCount: number
  totalVotes: number
  votes_sp: number
  votes_miq: number
  votes_ext: number
}

const cards = [
  { key: 'active', label: 'Actifs', color: '#1CA87A' },
  { key: 'pending', label: 'En attente', color: '#E8A020' },
  { key: 'archived', label: 'Archivés', color: '#4B5F7C' },
  { key: 'votes', label: 'Votes total', color: '#1B7FC4' },
] as const

export default function StatsCards({
  activeCount,
  pendingCount,
  archivedCount,
  totalVotes,
  votes_sp,
  votes_miq,
  votes_ext,
}: StatsCardsProps) {
  const values: Record<string, number> = {
    active: activeCount,
    pending: pendingCount,
    archived: archivedCount,
    votes: totalVotes,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.key}
            className="bg-surface-1 rounded-xl p-4 border border-rock/20"
          >
            <p className="text-xs text-muted mb-1">{card.label}</p>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: card.color }}
            >
              {values[card.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Répartition géo globale */}
      <div className="bg-surface-1 rounded-xl p-4 border border-rock/20">
        <GeoBreakdown
          votes_sp={votes_sp}
          votes_miq={votes_miq}
          votes_ext={votes_ext}
          total_votes={totalVotes}
          variant="full"
        />
      </div>
    </div>
  )
}
