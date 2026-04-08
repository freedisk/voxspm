'use client'

import { useEffect, useRef, useState } from 'react'
import VoteForm from '@/components/polls/VoteForm'
import ResultsBars from '@/components/polls/ResultsBars'
import GeoBreakdown from '@/components/polls/GeoBreakdown'
import Badge from '@/components/ui/Badge'

import { useGeo } from '@/lib/context/GeoContext'

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

export interface ModalPoll {
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

interface PollModalProps {
  poll: ModalPoll
  isOpen: boolean
  onClose: () => void
  onVoteRegistered: (pollId: string, optionId: string, location: 'saint_pierre' | 'miquelon' | 'exterieur') => void
}

export default function PollModal({ poll, isOpen, onClose, onVoteRegistered }: PollModalProps) {
  const [hasUnsavedSelection, setHasUnsavedSelection] = useState(false)
  // Capturée via le onChange bubblant du wrapper — reflète la sélection radio courante
  const selectedOptionIdRef = useRef<string | null>(null)

  
  const { location } = useGeo();

  // Ref pour capturer la dernière version d'attemptClose sans re-enregistrer l'écouteur
  const attemptCloseRef = useRef<() => void>(() => {})

  function attemptClose() {
    if (hasUnsavedSelection) {
      if (window.confirm('Abandonner ce vote ? Votre sélection ne sera pas enregistrée.')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  // Maintenir le ref à jour à chaque render pour capturer l'état frais
  useEffect(() => {
    attemptCloseRef.current = attemptClose
  })

  // Écoute Escape — enregistré une seule fois au montage, lit via ref
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') attemptCloseRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Verrouillage du scroll body pendant l'ouverture
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Réinitialiser la sélection quand on change de sondage
  useEffect(() => {
    setHasUnsavedSelection(false)
  }, [poll.id])

  if (!isOpen) return null

  const sortedOptions = [...poll.options].sort((a, b) => a.order_index - b.order_index)

  const dateFormatted = new Date(poll.proposed_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-backdrop-anim"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={attemptClose}
      role="presentation"
    >
      <div
        // 🎨 Intent: border-radius top uniquement mobile, complet sur desktop
        className="w-full md:max-w-[640px] max-h-[90vh] md:max-h-[85vh] flex flex-col modal-content-mobile rounded-t-3xl md:rounded-3xl"
        style={{ background: 'var(--white)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="poll-modal-title"
      >
        {/* HEADER sticky */}
        <div
          className="flex items-start gap-4 p-6 pb-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2
            id="poll-modal-title"
            className="flex-1 font-bold"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)',
              color: '#0A1628',
              lineHeight: 1.25,
            }}
          >
            {poll.question}
          </h2>
          <button
            onClick={attemptClose}
            aria-label="Fermer la modale"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-2xl leading-none transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-muted)' }}
          >
            ×
          </button>
        </div>

        {/* BODY scrollable */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Description */}
          {poll.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {poll.description}
            </p>
          )}

          {/* Tags */}
          {poll.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {poll.tags.map((tag) => (
                <Badge key={tag.id} label={tag.name} color={tag.color} icon={tag.icon} />
              ))}
            </div>
          )}

          {/* Meta */}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Proposé par {poll.proposer_name ?? 'Anonyme'} · {dateFormatted}
          </p>

          {/* Vote — wrapper onChange pour détecter sélection sans modifier VoteForm */}
          <div
            onChange={(e: React.ChangeEvent<HTMLDivElement>) => {
              const target = e.target as HTMLInputElement
              if (target.type === 'radio') {
                setHasUnsavedSelection(true)
                // Mémoriser l'option sélectionnée pour l'update optimiste post-vote
                selectedOptionIdRef.current = target.value
              }
            }}
          >
            <VoteForm
              pollId={poll.id}
              options={sortedOptions}
              onVoteSuccess={() => {
                // Notifier HomeClient avant fermeture pour l'update optimiste des compteurs
                if (selectedOptionIdRef.current && location) {
                  onVoteRegistered(poll.id, selectedOptionIdRef.current, location as 'saint_pierre' | 'miquelon' | 'exterieur')
                }
                // Vote enregistré → fermeture directe, pas de confirmation
                setHasUnsavedSelection(false)
                onClose()
              }}
              onLocationRequired={() => {
                // La géolocalisation n'est pas accessible depuis la modale → page dédiée
                window.location.href = `/poll/${poll.slug}`
              }}
            />
          </div>

          {/* Séparateur résultats */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* Résultats */}
          <div>
            <p
              className="uppercase tracking-wider mb-3 font-medium"
              style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}
            >
              Résultats actuels · {poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}
            </p>
            <ResultsBars options={sortedOptions} total_votes={poll.total_votes} />
          </div>

          {/* Répartition géographique */}
          <GeoBreakdown
            votes_sp={poll.votes_sp}
            votes_miq={poll.votes_miq}
            votes_ext={poll.votes_ext}
            total_votes={poll.total_votes}
          />
        </div>

        {/* FOOTER sticky */}
        <div
          className="flex items-center justify-between gap-3 p-4 shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={attemptClose}
            className="min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
          >
            Annuler
          </button>
          <a
            href={`/poll/${poll.slug}`}
            className="text-xs underline decoration-dotted transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            Page complète →
          </a>
        </div>
      </div>
    </div>
  )
}
