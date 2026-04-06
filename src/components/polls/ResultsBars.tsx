interface Option {
  id: string
  text: string
  votes_count: number
}

interface ResultsBarsProps {
  options: Option[]
  total_votes: number
}

// 🎨 Intent: couleurs dégradées — leader ocean, 2nd bleu clair, reste slate
function getBarColor(rank: number): string {
  if (rank === 0) return '#1A6FB5'
  if (rank === 1) return '#93C5E8'
  return '#CBD5E1'
}

export default function ResultsBars({ options, total_votes }: ResultsBarsProps) {
  const maxVotes = Math.max(...options.map((o) => o.votes_count))

  // Trier par votes pour déterminer le rank de chaque option
  const ranked = [...options]
    .sort((a, b) => b.votes_count - a.votes_count)
    .map((o, i) => ({ id: o.id, rank: i }))

  const rankMap = new Map(ranked.map((r) => [r.id, r.rank]))

  return (
    <div className="flex flex-col gap-3.5">
      {options.map((option) => {
        const pct = total_votes > 0 ? (option.votes_count / total_votes) * 100 : 0
        const isLeader = option.votes_count > 0 && option.votes_count === maxVotes
        const rank = rankMap.get(option.id) ?? 2
        const barColor = getBarColor(rank)

        return (
          <div key={option.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span
                className={isLeader ? 'font-medium' : ''}
                style={{ color: isLeader ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                {option.text}
              </span>
              <span
                className="tabular-nums text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {option.votes_count} ({Math.round(pct)}%)
              </span>
            </div>
            {/* 🎨 Intent: leader 8px, autres 6px, transition cubic-bezier Apple */}
            <div
              className="rounded-full overflow-hidden"
              style={{
                height: isLeader ? '8px' : '6px',
                background: 'var(--surface-3)',
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: barColor,
                  transition: 'width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  animation: 'bar-fill 0.8s ease-out',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
