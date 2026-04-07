'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const SessionContext = createContext<{
  userId: string | null
  isReady: boolean
}>({ userId: null, isReady: false })

export function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      // Vérifier si session existante
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
      } else {
        // Créer session anonyme CÔTÉ CLIENT → cookie posé automatiquement
        const { data } = await supabase.auth.signInAnonymously()
        setUserId(data.user?.id ?? null)
      }
      setIsReady(true)
    }

    init()
  }, [])

  return (
    <SessionContext.Provider value={{ userId, isReady }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)
