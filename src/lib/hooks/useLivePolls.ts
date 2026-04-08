'use client'

import { useEffect, useState, useRef, type Dispatch, type SetStateAction } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface PollOption {
  id: string
  text: string
  votes_count: number
  order_index: number
}

export interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
  order_index: number
  active_polls_count: number
}

export interface Poll {
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
  tags: Tag[]
  options: PollOption[]
}

// Reproduit le pattern de page.tsx (2 requêtes) pour éviter l'ambiguïté FK dans poll_tags
async function fetchPollById(
  supabase: ReturnType<typeof createClient>,
  id: string
): Promise<Poll | null> {
  const { data: pollData, error } = await supabase
    .from('polls')
    .select(`
      id, slug, question, description, total_votes, proposed_at, proposer_name,
      votes_sp, votes_miq, votes_ext,
      poll_tags ( tag_id ),
      options ( id, text, votes_count, order_index )
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (error || !pollData) return null

  const tagIds = (pollData.poll_tags as { tag_id: string }[]).map((pt) => pt.tag_id)
  let tags: Tag[] = []

  if (tagIds.length > 0) {
    const { data: tagsData } = await supabase
      .from('tags')
      .select('id, name, slug, color, icon, order_index')
      .in('id', tagIds)

    // active_polls_count = 0 : valeur de tri non critique pour un seul poll fraîchement activé
    tags = (tagsData ?? []).map((t) => ({ ...t, active_polls_count: 0 }))
  }

  return {
    id: pollData.id as string,
    slug: pollData.slug as string,
    question: pollData.question as string,
    description: pollData.description as string | null,
    total_votes: pollData.total_votes as number,
    proposed_at: pollData.proposed_at as string,
    proposer_name: pollData.proposer_name as string | null,
    votes_sp: pollData.votes_sp as number,
    votes_miq: pollData.votes_miq as number,
    votes_ext: pollData.votes_ext as number,
    tags,
    options: (pollData.options as PollOption[]) ?? [],
  }
}

function sortByProposedAt(polls: Poll[]): Poll[] {
  return [...polls].sort(
    (a, b) => new Date(b.proposed_at).getTime() - new Date(a.proposed_at).getTime()
  )
}

// Signature étendue : retourne le setter pour préserver le vote optimiste dans HomeClient
export function useLivePolls(
  initialPolls: Poll[],
  onNewPoll?: (pollId: string) => void
): [Poll[], Dispatch<SetStateAction<Poll[]>>] {
  const [polls, setPolls] = useState<Poll[]>(initialPolls)
  const supabaseRef = useRef(createClient())
  // Tracker des IDs déjà connus — distingue les vraies transitions des updates vote trigger
  const pollIdsRef = useRef<Set<string>>(new Set(initialPolls.map((p) => p.id)))

  useEffect(() => {
    const supabase = supabaseRef.current

    const channel: RealtimeChannel = supabase
      .channel('home-polls-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'polls' },
        async (payload) => {
          const incoming = payload.new as { id: string; status: string }

          // INSERT direct en status active (cas rare)
          if (incoming.status === 'active' && !pollIdsRef.current.has(incoming.id)) {
            const poll = await fetchPollById(supabase, incoming.id)
            if (!poll) return
            pollIdsRef.current.add(poll.id)
            setPolls((prev) => sortByProposedAt([poll, ...prev]))
            onNewPoll?.(poll.id)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'polls' },
        async (payload) => {
          const incoming = payload.new as { id: string; status: string; proposed_at: string }
          const { id, status } = incoming

          if (status === 'active' && !pollIdsRef.current.has(id)) {
            // CAS 1 : transition pending → active
            const poll = await fetchPollById(supabase, id)
            if (!poll) return
            pollIdsRef.current.add(id)
            setPolls((prev) => sortByProposedAt([poll, ...prev]))
            onNewPoll?.(id)
          } else if (status === 'archived' && pollIdsRef.current.has(id)) {
            // CAS 2 : active → archived
            pollIdsRef.current.delete(id)
            setPolls((prev) => prev.filter((p) => p.id !== id))
          } else if (status === 'pending' && pollIdsRef.current.has(id)) {
            // CAS 3 : rollback admin active → pending
            pollIdsRef.current.delete(id)
            setPolls((prev) => prev.filter((p) => p.id !== id))
          } else if (status === 'active' && pollIdsRef.current.has(id)) {
            // CAS 4 : poll déjà connu, toujours actif
            // Vérifier si proposed_at a changé → réordonner
            // Si non → NO-OP (update trigger vote : total_votes, updated_at, etc.)
            setPolls((prev) => {
              const existing = prev.find((p) => p.id === id)
              if (!existing) return prev
              if (existing.proposed_at === incoming.proposed_at) return prev // NO-OP
              return sortByProposedAt(
                prev.map((p) => (p.id === id ? { ...p, proposed_at: incoming.proposed_at } : p))
              )
            })
          }
          // Tous les autres cas → NO-OP implicite
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      // Reset du Set pour éviter les fuites si le composant est remonté
      pollIdsRef.current.clear()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [polls, setPolls]
}
