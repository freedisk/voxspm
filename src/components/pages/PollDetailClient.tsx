'use client'

import { useState, useCallback } from 'react'
import Badge from '@/components/ui/Badge'
import VoteForm from '@/components/polls/VoteForm'
import ResultsBars from '@/components/polls/ResultsBars'
import GeoBreakdown from '@/components/polls/GeoBreakdown'
import GeoModal from '@/components/layout/GeoModal'
import { useVote } from '@/lib/hooks/useVote'
import { useRealtimeVotes } from '@/lib/hooks/useRealtimeVotes'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

interface OptionData {
  id: string
  text: string
  votes_count: number
  order_index: number
}

interface PollData {
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
}

interface PollDetailClientProps {
  poll: PollData
  initialOptions: OptionData[]
  tags: Tag[]
}

export default function PollDetailClient({
  poll,
  initialOptions,
  tags,
}: PollDetailClientProps) {
  const { hasVoted, isLoading: voteLoading } = useVote(poll.id)
  const [justVoted, setJustVoted] = useState(false)
  const [geoModalOpen, setGeoModalOpen] = useState(false)

  const { options, pollGeo, isConnected } = useRealtimeVotes(
    poll.id,
    initialOptions,
    {
      votes_sp: poll.votes_sp,
      votes_miq: poll.votes_miq,
      votes_ext: poll.votes_ext,
      total_votes: poll.total_votes,
    }
  )

  const handleVoteSuccess = useCallback(() => setJustVoted(true), [])
  const handleLocationRequired = useCallback(() => setGeoModalOpen(true), [])

  const date = new Date(poll.proposed_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const showVoteForm = !hasVoted && !justVoted && !voteLoading

  return (
    <div className="max-w-2xl mx-auto py-8 flex flex-col gap-6">
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag.id} label={tag.name} color={tag.color} icon={tag.icon} />
          ))}
        </div>
      )}

      {/* 🎨 Intent: question en Instrument Serif, grande taille */}
      <h1
        className="leading-tight tracking-[-0.5px]"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 4vw, 40px)',
          color: 'var(--text-primary)',
        }}
      >
        {poll.question}
      </h1>

      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Proposé par {poll.proposer_name ?? 'Anonyme'} le {date}
      </p>

      {poll.description && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {poll.description}
        </p>
      )}

      {/* Vote form */}
      {showVoteForm && (
        <div
          className="rounded-[var(--radius)] p-5 sm:p-6 border"
          style={{
            background: 'var(--white)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            className="text-xs font-medium uppercase tracking-wider mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            Votre vote
          </h2>
          <VoteForm
            pollId={poll.id}
            options={options}
            onVoteSuccess={handleVoteSuccess}
            onLocationRequired={handleLocationRequired}
          />
        </div>
      )}

      {(hasVoted || justVoted) && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-sm)] text-sm font-medium"
          style={{
            background: 'rgba(28,168,122,0.08)',
            color: 'var(--success)',
          }}
        >
          ✓ Votre vote a été enregistré
        </div>
      )}

      {/* Résultats */}
      <div
        className="rounded-[var(--radius)] p-5 sm:p-6 border"
        style={{
          background: 'var(--white)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Résultats
          </h2>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="tabular-nums">
              {pollGeo.total_votes} vote{pollGeo.total_votes > 1 ? 's' : ''}
            </span>
            {isConnected && (
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'var(--success)',
                    animation: 'pulse-dot 2s ease-in-out infinite',
                  }}
                />
                <span style={{ color: 'var(--success)' }}>Live</span>
              </span>
            )}
          </div>
        </div>
        <ResultsBars options={options} total_votes={pollGeo.total_votes} />
      </div>

      {/* Geo breakdown */}
      <div
        className="rounded-[var(--radius)] p-5 sm:p-6 border"
        style={{
          background: 'var(--white)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <GeoBreakdown
          votes_sp={pollGeo.votes_sp}
          votes_miq={pollGeo.votes_miq}
          votes_ext={pollGeo.votes_ext}
          total_votes={pollGeo.total_votes}
          variant="full"
        />
      </div>

      <GeoModal isOpen={geoModalOpen} onClose={() => setGeoModalOpen(false)} />
    </div>
  )
}
