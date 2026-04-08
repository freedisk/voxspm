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

  // Ref stable — évite de recréer le client à chaque render (même pattern que useRealtimeVotes)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current

    const channel: RealtimeChannel = supabase
      .channel('hero-stats-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => {
          // Chaque nouveau vote incrémente le compteur global
          setStats((prev) => ({ ...prev, totalVotes: prev.totalVotes + 1 }))
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'polls' },
        (payload) => {
          const newPoll = payload.new as { status: string }
          // Un nouveau poll actif incrémente activePolls ET completedPolls
          if (newPoll.status === 'active') {
            setStats((prev) => ({
              ...prev,
              activePolls: prev.activePolls + 1,
              completedPolls: prev.completedPolls + 1,
            }))
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'polls' },
        (payload) => {
          const old = payload.old as { status?: string }
          const updated = payload.new as { status: string }

          if (old.status !== 'active' && updated.status === 'active') {
            // Poll vient d'être activé (pending → active)
            setStats((prev) => ({
              ...prev,
              activePolls: prev.activePolls + 1,
              completedPolls: prev.completedPolls + 1,
            }))
          } else if (old.status === 'active' && updated.status === 'archived') {
            // Poll archivé : sort de activePolls mais completedPolls reste stable
            // (SSR = archived + active, le poll était déjà compté dans completedPolls)
            setStats((prev) => ({
              ...prev,
              activePolls: prev.activePolls - 1,
            }))
          }
        }
      )
      .subscribe()

    // Cleanup obligatoire — éviter les fuites de connexion WebSocket
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return stats
}
