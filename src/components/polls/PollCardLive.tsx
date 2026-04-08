'use client'

import { useState, useEffect, useRef } from 'react'
import Badge from '@/components/ui/Badge'
import { useRealtimeVotes } from '@/lib/hooks/useRealtimeVotes'

function AnimatedPercent({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const fromRef = useRef<number>(value)

  useEffect(() => {
    if (display === value) return
    fromRef.current = display
    startRef.current = performance.now()
    const duration = 1100
    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const t = Math.min(1, elapsed / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      const next = fromRef.current + (value - fromRef.current) * eased
      setDisplay(next)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <>{Math.round(display)}%</>
}

interface PollTag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

interface PollOption {
  id: string
  text: string
  votes_count: number
  order_index: number
}

interface PollCardData {
  id: string
  slug: string
  question: string
  description: string | null
  total_votes: number
  proposed_at: string
  proposer_name: string | null
  votes_sp: number
  votes_miq: number
  votes_ext: number
  tags: PollTag[]
  options: PollOption[]
}

interface PollCardLiveProps extends PollCardData {
  status?: string
  onParticiper?: (poll: PollCardData) => void
}

// 🎨 Intent: couleurs géo fixes — non interchangeables
const GEO_ITEMS = [
  { key: 'sp' as const, label: 'Saint-Pierre', color: '#1A6FB5' },
  { key: 'miq' as const, label: 'Miquelon', color: '#0C9A78' },
  { key: 'ext' as const, label: 'Extérieur', color: '#6B4FA0' },
]

export default function PollCardLive({
  id,
  slug,
  question,
  description = null,
  total_votes,
  proposed_at,
  proposer_name,
  tags,
  options,
  votes_sp,
  votes_miq,
  votes_ext,
  status = 'active',
  onParticiper,
}: PollCardLiveProps) {
  const [pulsingIds, setPulsingIds] = useState<Set<string>>(new Set())
  // Ref pour détecter quelles barres ont changé entre deux renders (options + géo)
  const prevPctsRef = useRef<Record<string, number>>({})

  const { options: liveOptions, pollGeo } = useRealtimeVotes(
    id,
    options,
    { votes_sp, votes_miq, votes_ext, total_votes }
  )

  const liveTotalVotes = pollGeo.total_votes
  const geoCounts = { sp: pollGeo.votes_sp, miq: pollGeo.votes_miq, ext: pollGeo.votes_ext }

  // Détecter quelles barres (options + géo) ont changé → pulse 800ms
  useEffect(() => {
    const prev = prevPctsRef.current
    const total = pollGeo.total_votes || 1
    const currentPcts: Record<string, number> = {}
    const changed = new Set<string>()

    // Pourcentages options
    for (const opt of liveOptions) {
      const pct = Math.round((opt.votes_count / total) * 100)
      currentPcts[opt.id] = pct
      if (prev[opt.id] !== undefined && prev[opt.id] !== pct) changed.add(opt.id)
    }

    // Pourcentages géo
    const geoMap = { sp: pollGeo.votes_sp, miq: pollGeo.votes_miq, ext: pollGeo.votes_ext }
    for (const [key, count] of Object.entries(geoMap)) {
      const geoId = `geo-${key}`
      const pct = Math.round((count / total) * 100)
      currentPcts[geoId] = pct
      if (prev[geoId] !== undefined && prev[geoId] !== pct) changed.add(geoId)
    }

    prevPctsRef.current = currentPcts

    if (changed.size === 0) return

    setPulsingIds(changed)
    const timer = setTimeout(() => setPulsingIds(new Set()), 1400)
    return () => clearTimeout(timer)
  }, [liveOptions, pollGeo])

  const date = new Date(proposed_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const sortedOptions = [...liveOptions].sort((a, b) => a.order_index - b.order_index)

  return (
    <div
      className="poll-card-hover rounded-2xl border overflow-hidden"
      style={{
        background: 'var(--white)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="p-6 sm:p-8">
        {/* 1. LIGNE TAGS */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag.id} label={tag.name} color={tag.color} icon={tag.icon} />
            ))}
          </div>
        )}

        {/* 2. QUESTION — Instrument Serif, texte complet */}
        <h2
          className="font-bold mt-3 mb-6"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
            color: '#0A1628',
            lineHeight: 1.2,
          }}
        >
          {question}
        </h2>

        {/* 3. BARRES RÉSULTATS — Live avec animation glissement + pulse */}
        <div className="flex flex-col gap-3">
          {sortedOptions.map((option) => {
            const pct = liveTotalVotes > 0 ? (option.votes_count / liveTotalVotes) * 100 : 0
            const isPulsed = pulsingIds.has(option.id)
            return (
              <div key={option.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-primary)' }}>{option.text}</span>
                  <span className="tabular-nums text-xs shrink-0 ml-3" style={{ color: 'var(--text-muted)' }}>
                    <AnimatedPercent value={pct} /> · {option.votes_count}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: '#E8EDF5' }}
                >
                  <div
                    className={`h-full rounded-full${isPulsed ? ' vote-pulse' : ''}`}
                    style={{
                      width: `${pct}%`,
                      background: '#1A6FB5',
                      transition: 'width 1100ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* 4. SÉPARATEUR */}
        <div className="my-5" style={{ borderTop: '1px solid var(--border)' }} />

        {/* 5. GEO BREAKDOWN MINI */}
        <div>
          <p
            className="uppercase tracking-wider mb-3"
            style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}
          >
            Répartition géographique
          </p>
          <div className="flex flex-col gap-2.5">
            {GEO_ITEMS.map((geo) => {
              const count = geoCounts[geo.key]
              const pct = liveTotalVotes > 0 ? (count / liveTotalVotes) * 100 : 0
              return (
                <div key={geo.key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: geo.color }}>
                      {geo.label}
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {count} (<AnimatedPercent value={pct} />)
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: '#E8EDF5' }}>
                    <div
                      className={`h-full rounded-full${pulsingIds.has(`geo-${geo.key}`) ? ' vote-pulse' : ''}`}
                      style={{
                        width: `${Math.max(pct, 0)}%`,
                        background: geo.color,
                        transition: 'width 1100ms cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 6. LIGNE BAS */}
        <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {liveTotalVotes} vote{liveTotalVotes > 1 ? 's' : ''} · {proposer_name ?? 'Anonyme'} · {date}
          </span>

          <div className="flex items-center gap-3">
            {status === 'active' && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--success)' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'var(--success)',
                    animation: 'pulse-dot 2s ease-in-out infinite',
                  }}
                />
                Live
              </span>
            )}

            <button
              onClick={() => onParticiper?.({
                id,
                slug,
                question,
                description,
                total_votes: liveTotalVotes,
                proposed_at,
                proposer_name: proposer_name ?? null,
                votes_sp: pollGeo.votes_sp,
                votes_miq: pollGeo.votes_miq,
                votes_ext: pollGeo.votes_ext,
                tags,
                options: liveOptions,
              })}
              className="
                inline-flex items-center px-5 py-2
                rounded-full text-sm font-medium text-white
                transition-all duration-200
                hover:opacity-90
              "
              style={{ background: '#1A6FB5' }}
            >
              Participer →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
