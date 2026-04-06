interface GeoBreakdownProps {
  votes_sp: number
  votes_miq: number
  votes_ext: number
  total_votes: number
  variant?: 'compact' | 'full'
}

// Couleurs géo-sémantiques — jamais interchangeables (cf CLAUDE.md §8)
const GEO_COLORS = {
  sp: '#1B7FC4',
  miq: '#10A585',
  ext: '#7B5EA7',
} as const

export default function GeoBreakdown({
  votes_sp,
  votes_miq,
  votes_ext,
  total_votes,
  variant = 'full',
}: GeoBreakdownProps) {
  if (total_votes === 0) {
    return (
      <p className="text-sm text-muted italic">Aucun vote pour l&apos;instant</p>
    )
  }

  const items = [
    { label: 'Saint-Pierre', count: votes_sp, color: GEO_COLORS.sp },
    { label: 'Miquelon', count: votes_miq, color: GEO_COLORS.miq },
    { label: 'Extérieur', count: votes_ext, color: GEO_COLORS.ext },
  ]

  if (variant === 'compact') {
    // Version PollCard — barre horizontale empilée sans labels
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-surface-2 flex">
          {items.map((item) => {
            const pct = (item.count / total_votes) * 100
            if (pct === 0) return null
            return (
              <div
                key={item.label}
                style={{ width: `${pct}%`, backgroundColor: item.color }}
                className="h-full"
                title={`${item.label}: ${item.count} (${Math.round(pct)}%)`}
              />
            )
          })}
        </div>
        <span className="text-xs text-muted tabular-nums shrink-0">
          {total_votes} vote{total_votes > 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  // Version full — 3 barres détaillées
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted">Répartition géographique</h3>
      {items.map((item) => {
        const pct = (item.count / total_votes) * 100
        return (
          <div key={item.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{item.label}</span>
              <span className="text-muted tabular-nums">
                {item.count} ({Math.round(pct)}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color,
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
