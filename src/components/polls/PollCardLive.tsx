'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { useRealtimeVotes } from '@/lib/hooks/useRealtimeVotes'

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

interface PollCardLiveProps {
  id: string
  slug: string
  question: string
  total_votes: number
  proposed_at: string
  proposer_name: string | null
  tags: PollTag[]
  options: PollOption[]
  votes_sp: number
  votes_miq: number
  votes_ext: number
  status?: string
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
  total_votes,
  proposed_at,
  proposer_name,
  tags,
  options,
  votes_sp,
  votes_miq,
  votes_ext,
  status = 'active',
}: PollCardLiveProps) {
  const [pulsedOptionId, setPulsedOptionId] = useState<string | null>(null)
  // Ref pour détecter quelle option a changé entre deux renders du hook
  const prevOptionsRef = useRef<PollOption[]>(options)

  const { options: liveOptions, pollGeo } = useRealtimeVotes(
    id,
    options,
    { votes_sp, votes_miq, votes_ext, total_votes }
  )

  const liveTotalVotes = pollGeo.total_votes
  const geoCounts = { sp: pollGeo.votes_sp, miq: pollGeo.votes_miq, ext: pollGeo.votes_ext }

  // Détecter quelle option a reçu un vote → déclencher le pulse 800ms
  useEffect(() => {
    const prev = prevOptionsRef.current
    const changed = liveOptions.find((opt) => {
      const prevOpt = prev.find((p) => p.id === opt.id)
      return prevOpt !== undefined && prevOpt.votes_count !== opt.votes_count
    })

    if (changed) {
      setPulsedOptionId(changed.id)
      const timer = setTimeout(() => setPulsedOptionId(null), 800)
      prevOptionsRef.current = liveOptions
      return () => clearTimeout(timer)
    }

    prevOptionsRef.current = liveOptions
  }, [liveOptions])

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
            const isPulsed = pulsedOptionId === option.id
            return (
              <div key={option.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-primary)' }}>{option.text}</span>
                  <span className="tabular-nums text-xs shrink-0 ml-3" style={{ color: 'var(--text-muted)' }}>
                    {Math.round(pct)}% · {option.votes_count}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: '#E8EDF5' }}
                >
                  <div
                    // vox-pulse déclenche l'animation keyframe définie dans globals.css
                    className={`h-full rounded-full${isPulsed ? ' vox-pulse' : ''}`}
                    style={{
                      width: `${pct}%`,
                      background: '#1A6FB5',
                      transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
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
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: '#E8EDF5' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(pct, 0)}%`,
                        background: geo.color,
                        transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
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

            <Link
              href={`/poll/${slug}`}
              className="
                inline-flex items-center px-5 py-2
                rounded-full text-sm font-medium text-white
                transition-all duration-200
                hover:opacity-90
              "
              style={{ background: '#1A6FB5' }}
            >
              Participer →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
