'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface AdminTag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

export interface AdminPoll {
  id: string
  slug: string
  question: string
  status: 'pending' | 'active' | 'archived'
  total_votes: number
  proposed_at: string
  proposer_name: string | null
  votes_sp: number
  votes_miq: number
  votes_ext: number
  tags: AdminTag[]
}

// Reproduit le pattern de useLivePolls.ts — sans filtre status (l'admin voit tout)
async function fetchAdminPollById(
  supabase: ReturnType<typeof createClient>,
  id: string,
  tagMap: Map<string, AdminTag>
): Promise<AdminPoll | null> {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      id, slug, question, status, total_votes, proposed_at, proposer_name,
      votes_sp, votes_miq, votes_ext,
      poll_tags ( tag_id )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  const tags = (data.poll_tags as { tag_id: string }[])
    .map((pt) => tagMap.get(pt.tag_id))
    .filter((t): t is AdminTag => t !== undefined)

  return {
    id: data.id as string,
    slug: data.slug as string,
    question: data.question as string,
    status: data.status as 'pending' | 'active' | 'archived',
    total_votes: data.total_votes as number,
    proposed_at: data.proposed_at as string,
    proposer_name: data.proposer_name as string | null,
    votes_sp: data.votes_sp as number,
    votes_miq: data.votes_miq as number,
    votes_ext: data.votes_ext as number,
    tags,
  }
}

export function useLiveAdminPolls(
  initialPolls: AdminPoll[],
  initialTags: AdminTag[]
): { polls: AdminPoll[]; newPollIds: Set<string> } {
  const [polls, setPolls] = useState<AdminPoll[]>(initialPolls)
  const [newPollIds, setNewPollIds] = useState<Set<string>>(new Set())
  const supabaseRef = useRef(createClient())
  // tagMap construit au montage — stable pendant toute la vie du hook
  const tagMapRef = useRef<Map<string, AdminTag>>(new Map(initialTags.map((t) => [t.id, t])))
  // IDs déjà connus — distingue les vrais INSERT des updates tardifs
  const pollIdsRef = useRef<Set<string>>(new Set(initialPolls.map((p) => p.id)))

  useEffect(() => {
    const supabase = supabaseRef.current

    const channel: RealtimeChannel = supabase
      .channel('admin-polls-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'polls' },
        async (payload) => {
          const incoming = payload.new as { id: string }
          if (pollIdsRef.current.has(incoming.id)) return

          const poll = await fetchAdminPollById(supabase, incoming.id, tagMapRef.current)
          if (!poll) return

          pollIdsRef.current.add(poll.id)
          setPolls((prev) => [poll, ...prev])

          // Badge "✨ Nouveau" réservé aux INSERT — retiré après 5s
          setNewPollIds((prev) => new Set([...prev, poll.id]))
          setTimeout(() => {
            setNewPollIds((prev) => {
              const next = new Set(prev)
              next.delete(poll.id)
              return next
            })
          }, 5000)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'polls' },
        async (payload) => {
          const incoming = payload.new as {
            id: string
            status: string
            proposed_at: string
            total_votes: number
            votes_sp: number
            votes_miq: number
            votes_ext: number
          }
          const { id } = incoming

          if (!pollIdsRef.current.has(id)) {
            // Poll inconnu découvert via UPDATE (cas rare, ex : poll créé hors session)
            const poll = await fetchAdminPollById(supabase, id, tagMapRef.current)
            if (!poll) return
            pollIdsRef.current.add(id)
            setPolls((prev) => [poll, ...prev])
            // Pas de badge : le badge est réservé aux vrais INSERT
            return
          }

          setPolls((prev) => {
            const existing = prev.find((p) => p.id === id)
            if (!existing) return prev

            // Si status ou proposed_at a changé → refetch complet pour récupérer les tags à jour
            const needsRefetch =
              existing.status !== incoming.status ||
              existing.proposed_at !== incoming.proposed_at

            if (needsRefetch) {
              fetchAdminPollById(supabase, id, tagMapRef.current).then((refreshed) => {
                if (!refreshed) return
                setPolls((p) => p.map((poll) => (poll.id === id ? refreshed : poll)))
              })
            }

            // Merge immédiat des compteurs (trigger DB votes) — évite le flash
            return prev.map((p) =>
              p.id === id
                ? {
                    ...p,
                    status: incoming.status as 'pending' | 'active' | 'archived',
                    proposed_at: incoming.proposed_at,
                    total_votes: incoming.total_votes,
                    votes_sp: incoming.votes_sp,
                    votes_miq: incoming.votes_miq,
                    votes_ext: incoming.votes_ext,
                  }
                : p
            )
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'polls' },
        (payload) => {
          const deleted = payload.old as { id: string }
          pollIdsRef.current.delete(deleted.id)
          setPolls((prev) => prev.filter((p) => p.id !== deleted.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      pollIdsRef.current.clear()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { polls, newPollIds }
}
