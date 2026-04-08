'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface LiveStats {
  totalVotes: number
  activePolls: number
  completedPolls: number
}

export function useLiveStats(initial: LiveStats): LiveStats {
  const [stats, setStats] = useState<LiveStats>(initial)

  // Ref stable — évite de recréer le client à chaque render
  const supabaseRef = useRef(createClient())

  // Sets des IDs de polls connus — permet de distinguer les vraies transitions
  // de status des updates déclenché par le trigger vote (total_votes, etc.)
  const activePollIdsRef = useRef<Set<string>>(new Set())
  const realizedPollIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const supabase = supabaseRef.current

    // Initialiser les Sets AVANT l'abonnement Realtime pour éviter la race condition
    // On charge uniquement les IDs nécessaires (pas les données complètes)
    supabase
      .from('polls')
      .select('id, status')
      .in('status', ['active', 'archived'])
      .then(({ data }) => {
        for (const poll of (data ?? [])) {
          if (poll.status === 'active') {
            activePollIdsRef.current.add(poll.id)
          }
          // active ET archived comptent tous les deux comme "réalisés"
          realizedPollIdsRef.current.add(poll.id)
        }
      })

    const channel: RealtimeChannel = supabase
      .channel('hero-stats-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => {
          setStats((prev) => ({ ...prev, totalVotes: prev.totalVotes + 1 }))
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'polls' },
        (payload) => {
          const poll = payload.new as { id: string; status: string }

          if (poll.status === 'active' && !activePollIdsRef.current.has(poll.id)) {
            activePollIdsRef.current.add(poll.id)
            setStats((prev) => ({ ...prev, activePolls: prev.activePolls + 1 }))
          }

          if (
            (poll.status === 'active' || poll.status === 'archived') &&
            !realizedPollIdsRef.current.has(poll.id)
          ) {
            realizedPollIdsRef.current.add(poll.id)
            setStats((prev) => ({ ...prev, completedPolls: prev.completedPolls + 1 }))
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'polls' },
        (payload) => {
          const poll = payload.new as { id: string; status: string }
          const { id, status } = poll

          if (status === 'active' && !activePollIdsRef.current.has(id)) {
            // Transition pending → active
            activePollIdsRef.current.add(id)
            setStats((prev) => ({ ...prev, activePolls: prev.activePolls + 1 }))

            if (!realizedPollIdsRef.current.has(id)) {
              realizedPollIdsRef.current.add(id)
              setStats((prev) => ({ ...prev, completedPolls: prev.completedPolls + 1 }))
            }
          } else if (status === 'archived' && activePollIdsRef.current.has(id)) {
            // Transition active → archived
            activePollIdsRef.current.delete(id)
            setStats((prev) => ({ ...prev, activePolls: prev.activePolls - 1 }))
            // completedPolls reste stable : le poll était déjà dans realizedPollIdsRef
          } else if (status === 'pending' && activePollIdsRef.current.has(id)) {
            // Rollback admin : active → pending
            activePollIdsRef.current.delete(id)
            realizedPollIdsRef.current.delete(id)
            setStats((prev) => ({
              ...prev,
              activePolls: prev.activePolls - 1,
              completedPolls: prev.completedPolls - 1,
            }))
          }
          // Tous les autres cas (update total_votes, updated_at, etc.) → NO-OP
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      // Reset des Sets pour éviter des fuites si le composant est remonté
      activePollIdsRef.current.clear()
      realizedPollIdsRef.current.clear()
    }
  }, [])

  return stats
}
