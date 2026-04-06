interface GeoBreakdownProps {
  votes_sp: number
  votes_miq: number
  votes_ext: number
  total_votes: number
  variant?: 'compact' | 'full'
}

// 🎨 Intent: couleurs géo-sémantiques fixes — jamais interchangeables
const GEO_ITEMS = [
  { key: 'sp', label: 'Saint-Pierre', color: '#1A6FB5' },
  { key: 'miq', label: 'Miquelon', color: '#0C9A78' },
  { key: 'ext', label: 'Extérieur', color: '#6B4FA0' },
] as const

export default function GeoBreakdown({
  votes_sp,
  votes_miq,
  votes_ext,
  total_votes,
  variant = 'full',
}: GeoBreakdownProps) {
  const counts = { sp: votes_sp, miq: votes_miq, ext: votes_ext }

  if (total_votes === 0) {
    return (
      <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
        Aucun vote pour l&apos;instant
      </p>
    )
  }

  if (variant === 'compact') {
    // 🎨 Intent: barre empilée fine pour PollCard — 4px, pas de labels
    return (
      <div className="flex items-center gap-2.5">
        <div
          className="flex-1 h-1 rounded-full overflow-hidden flex"
          style={{ background: 'var(--surface-3)' }}
        >
          {GEO_ITEMS.map((item) => {
            const pct = (counts[item.key] / total_votes) * 100
            if (pct === 0) return null
            return (
              <div
                key={item.key}
                style={{ width: `${pct}%`, backgroundColor: item.color }}
                className="h-full"
                title={`${item.label}: ${counts[item.key]} (${Math.round(pct)}%)`}
              />
            )
          })}
        </div>
      </div>
    )
  }

  // 🎨 Intent: version full — séparateur top + label uppercase + barres colorées 5px
  return (
    <div
      className="flex flex-col gap-3 pt-4 border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <h3
        className="uppercase tracking-wider font-medium"
        style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}
      >
        Répartition géographique
      </h3>
      {GEO_ITEMS.map((item) => {
        const count = counts[item.key]
        const pct = (count / total_votes) * 100
        return (
          <div key={item.key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium" style={{ color: item.color }}>
                {item.label}
              </span>
              <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {count} ({Math.round(pct)}%)
              </span>
            </div>
            <div
              className="h-[5px] rounded-full overflow-hidden"
              style={{ background: 'var(--surface-3)' }}
            >
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
