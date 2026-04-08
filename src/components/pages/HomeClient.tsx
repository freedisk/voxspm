'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TagFilter from '@/components/polls/TagFilter'
import PollCardLive from '@/components/polls/PollCardLive'
import PollModal, { type ModalPoll } from '@/components/polls/PollModal'
import WelcomeModal from '@/components/pages/WelcomeModal'
import { useLivePolls, type Poll } from '@/lib/hooks/useLivePolls'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
  order_index: number
  active_polls_count: number
}

interface HomeClientProps {
  tags: Tag[]
  polls: Poll[]
}

export default function HomeClient({ tags, polls: initialPolls }: HomeClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Badge éphémère "Nouveau" — IDs de polls fraîchement activés, auto-retiré après 5s
  const [newPollIds, setNewPollIds] = useState<Set<string>>(new Set())

  // Appelé par useLivePolls quand un sondage pending→active arrive en Realtime
  const handleNewPoll = useCallback((pollId: string) => {
    setNewPollIds((prev) => {
      const next = new Set(prev)
      next.add(pollId)
      return next
    })
    setTimeout(() => {
      setNewPollIds((prev) => {
        const next = new Set(prev)
        next.delete(pollId)
        return next
      })
    }, 5000)
  }, [])

  // Owner des polls — initialisé depuis les props serveur, synchronisé Realtime, mis à jour optimistiquement après un vote
  const [polls, setPolls] = useLivePolls(initialPolls, handleNewPoll)

  // Tags actifs depuis l'URL — réactif via useSearchParams (format : ?tag=slug1&tag=slug2)
  const activeTagSlugs = useMemo(
    () => searchParams.getAll('tag'),
    [searchParams]
  )

  // Filtrage local (OR) : dérivé de polls, ne casse pas la synchro Realtime
  const filteredPolls = useMemo(() => {
    if (activeTagSlugs.length === 0) return polls
    return polls.filter((poll) =>
      poll.tags.some((tag) => activeTagSlugs.includes(tag.slug))
    )
  }, [polls, activeTagSlugs])

  // Stocke l'id du poll ouvert plutôt que l'objet, pour toujours pointer vers la version fraîche du state
  const [modalPollId, setModalPollId] = useState<string | null>(null)

  const [welcomeOpen, setWelcomeOpen] = useState(false)

  // Première visite : ouvre la modale si jamais vue
  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = window.localStorage.getItem('voxspm_welcome_seen')
    if (!seen) {
      setWelcomeOpen(true)
    }
  }, [])

  // Permet de rouvrir la modale depuis le Footer via un custom event
  useEffect(() => {
    const handler = () => setWelcomeOpen(true)
    window.addEventListener('voxspm:open-welcome', handler)
    return () => window.removeEventListener('voxspm:open-welcome', handler)
  }, [])

  const handleCloseWelcome = () => {
    window.localStorage.setItem('voxspm_welcome_seen', '1')
    setWelcomeOpen(false)
  }

  // Source de vérité de la modale — toujours recalculée depuis le state polls à jour
  const modalPoll = useMemo(
    () => polls.find((p) => p.id === modalPollId) ?? null,
    [polls, modalPollId]
  )

  // Gestion du filtre par tag — replace pour ne pas polluer l'historique
  const handleToggle = useCallback((slug: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (slug === '__all__') {
      params.delete('tag')
    } else {
      const currentTags = params.getAll('tag')
      if (currentTags.includes(slug)) {
        params.delete('tag')
        currentTags.filter((t) => t !== slug).forEach((t) => params.append('tag', t))
      } else {
        params.append('tag', slug)
      }
    }

    router.replace(`/?${params.toString()}`)
  }, [router, searchParams])

  // Ouvre la modale et met à jour l'URL via pushState (pas de navigation Next.js)
  function openModal(poll: ModalPoll) {
    setModalPollId(poll.id)
    window.history.pushState({}, '', `/?poll=${poll.slug}`)
  }

  // Ferme la modale et nettoie l'URL
  const closeModal = useCallback(() => {
    setModalPollId(null)
    window.history.replaceState({}, '', '/')
  }, [])

  // Mise à jour optimiste après vote réussi — appelé par PollModal avant onClose
  const handleVoteRegistered = useCallback(
    (pollId: string, optionId: string, location: 'saint_pierre' | 'miquelon' | 'exterieur') => {
      setPolls((prev) => prev.map((p) => {
        if (p.id !== pollId) return p
        return {
          ...p,
          total_votes: p.total_votes + 1,
          votes_sp:  location === 'saint_pierre' ? p.votes_sp  + 1 : p.votes_sp,
          votes_miq: location === 'miquelon'     ? p.votes_miq + 1 : p.votes_miq,
          votes_ext: location === 'exterieur'    ? p.votes_ext + 1 : p.votes_ext,
          options: p.options.map((o) =>
            o.id === optionId ? { ...o, votes_count: o.votes_count + 1 } : o
          ),
        }
      }))
    },
    []
  )

  // Deep link au montage : si ?poll=<slug> dans l'URL, ouvrir le sondage correspondant
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('poll')
    if (!slug) return
    const found = polls.find((p) => p.slug === slug)
    if (found) {
      setModalPollId(found.id)
    } else {
      console.warn(`VoxSPM: sondage "${slug}" introuvable dans la liste courante — deep link ignoré`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionnellement vide : exécuté une seule fois au montage

  // Bouton back du navigateur : synchronise l'état modal avec l'URL
  useEffect(() => {
    function handlePopState() {
      const slug = new URLSearchParams(window.location.search).get('poll')
      if (slug) {
        const found = polls.find((p) => p.slug === slug)
        if (found) setModalPollId(found.id)
        else console.warn(`VoxSPM: sondage "${slug}" introuvable après popstate`)
      } else {
        // Retour arrière → fermeture directe sans confirmation
        setModalPollId(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [polls])

  return (
    <>
      <WelcomeModal isOpen={welcomeOpen} onClose={handleCloseWelcome} />

      <TagFilter
        tags={tags}
        activeTagSlugs={activeTagSlugs}
        onToggle={handleToggle}
      />

      {polls.length === 0 ? (
        <p
          className="text-center py-16 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Aucun sondage en cours — revenez bientôt !
        </p>
      ) : filteredPolls.length === 0 ? (
        <p
          className="text-center py-16 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Aucun sondage ne correspond à ce filtre.
        </p>
      ) : (
        // 🎨 Intent: grille 3 cols desktop / 2 cols tablette / 1 col mobile, max-w-6xl
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 max-w-6xl mx-auto px-4">
          {filteredPolls.map((poll) => (
            <PollCardLive
              key={poll.id}
              id={poll.id}
              slug={poll.slug}
              question={poll.question}
              description={poll.description}
              total_votes={poll.total_votes}
              proposed_at={poll.proposed_at}
              proposer_name={poll.proposer_name}
              tags={poll.tags}
              options={poll.options}
              votes_sp={poll.votes_sp}
              votes_miq={poll.votes_miq}
              votes_ext={poll.votes_ext}
              isNew={newPollIds.has(poll.id)}
              onParticiper={openModal}
            />
          ))}
        </div>
      )}

      {modalPoll && (
        <PollModal
          poll={modalPoll}
          isOpen={true}
          onClose={closeModal}
          onVoteRegistered={handleVoteRegistered}
        />
      )}
    </>
  )
}
