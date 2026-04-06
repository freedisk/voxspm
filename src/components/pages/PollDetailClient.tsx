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

  const handleVoteSuccess = useCallback(() => {
    setJustVoted(true)
  }, [])

  const handleLocationRequired = useCallback(() => {
    setGeoModalOpen(true)
  }, [])

  const date = new Date(poll.proposed_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const showVoteForm = !hasVoted && !justVoted && !voteLoading

  return (
    <div className="flex flex-col gap-6">
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag.id} label={tag.name} color={tag.color} icon={tag.icon} />
          ))}
        </div>
      )}

      {/* Question */}
      <h1 className="text-2xl font-bold text-foreground leading-tight">
        {poll.question}
      </h1>

      {/* Meta */}
      <p className="text-sm text-muted">
        Proposé par {poll.proposer_name ?? 'Anonyme'} le {date}
      </p>

      {poll.description && (
        <p className="text-sm text-muted">{poll.description}</p>
      )}

      {/* Vote form — affiché uniquement si l'user n'a pas encore voté */}
      {showVoteForm && (
        <div className="bg-surface-1 rounded-xl p-5 border border-rock/20">
          <h2 className="text-sm font-medium text-muted mb-3">Votre vote</h2>
          <VoteForm
            pollId={poll.id}
            options={options}
            onVoteSuccess={handleVoteSuccess}
            onLocationRequired={handleLocationRequired}
          />
        </div>
      )}

      {(hasVoted || justVoted) && (
        <p className="text-sm text-success font-medium">
          ✓ Votre vote a été enregistré
        </p>
      )}

      {/* Résultats — toujours visibles */}
      <div className="bg-surface-1 rounded-xl p-5 border border-rock/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted">Résultats</h2>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="tabular-nums">{pollGeo.total_votes} vote{pollGeo.total_votes > 1 ? 's' : ''}</span>
            {/* Point vert animé = connexion Realtime active */}
            {isConnected && (
              <span className="relative flex h-2 w-2" title="Résultats en direct">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
            )}
          </div>
        </div>
        <ResultsBars options={options} total_votes={pollGeo.total_votes} />
      </div>

      {/* Répartition géo — toujours visible */}
      <div className="bg-surface-1 rounded-xl p-5 border border-rock/20">
        <GeoBreakdown
          votes_sp={pollGeo.votes_sp}
          votes_miq={pollGeo.votes_miq}
          votes_ext={pollGeo.votes_ext}
          total_votes={pollGeo.total_votes}
          variant="full"
        />
      </div>

      {/* GeoModal si location requise pendant le vote */}
      <GeoModal isOpen={geoModalOpen} onClose={() => setGeoModalOpen(false)} />
    </div>
  )
}
