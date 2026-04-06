'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseVoteReturn {
  hasVoted: boolean
  votedOptionId: string | null
  isLoading: boolean
}

export function useVote(pollId: string): UseVoteReturn {
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function checkVote() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      // RLS policy "votes_own_read" garantit qu'on ne voit que ses propres votes
      const { data: vote } = await supabase
        .from('votes')
        .select('option_id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .single()

      setVotedOptionId(vote?.option_id ?? null)
      setIsLoading(false)
    }

    checkVote()
  }, [supabase, pollId])

  return {
    hasVoted: votedOptionId !== null,
    votedOptionId,
    isLoading,
  }
}
