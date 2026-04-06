'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface OptionData {
  id: string
  text: string
  votes_count: number
  order_index: number
}

interface PollGeo {
  votes_sp: number
  votes_miq: number
  votes_ext: number
  total_votes: number
}

interface UseRealtimeVotesReturn {
  options: OptionData[]
  pollGeo: PollGeo
  isConnected: boolean
}

export function useRealtimeVotes(
  pollId: string,
  initialOptions: OptionData[],
  initialGeo: PollGeo
): UseRealtimeVotesReturn {
  const [options, setOptions] = useState<OptionData[]>(initialOptions)
  const [pollGeo, setPollGeo] = useState<PollGeo>(initialGeo)
  const [isConnected, setIsConnected] = useState(false)

  // Ref stable pour le client Supabase — évite de recréer le canal à chaque render
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current

    // Canal unique par sondage — écoute options + polls en parallèle
    const channel: RealtimeChannel = supabase
      .channel(`poll-${pollId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'options',
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          const updated = payload.new as OptionData
          setOptions((prev) =>
            prev.map((opt) =>
              opt.id === updated.id
                ? { ...opt, votes_count: updated.votes_count }
                : opt
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'polls',
          filter: `id=eq.${pollId}`,
        },
        (payload) => {
          const updated = payload.new as PollGeo
          setPollGeo({
            votes_sp: updated.votes_sp,
            votes_miq: updated.votes_miq,
            votes_ext: updated.votes_ext,
            total_votes: updated.total_votes,
          })
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Cleanup obligatoire — éviter les fuites de connexion WebSocket
    return () => {
      supabase.removeChannel(channel)
    }
  }, [pollId])

  return { options, pollGeo, isConnected }
}
