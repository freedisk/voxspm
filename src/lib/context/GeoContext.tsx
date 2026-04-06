'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateUserLocation } from '@/lib/actions/polls'

type UserLocation = 'saint_pierre' | 'miquelon' | 'exterieur'

interface GeoContextValue {
  location: UserLocation | null
  isLoading: boolean
  setLocation: (location: UserLocation) => void
  updateAndPersistLocation: (location: UserLocation) => Promise<boolean>
}

const GeoContext = createContext<GeoContextValue | null>(null)

export function GeoProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLocation() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single()

      setLocation(profile?.location ?? null)
      setIsLoading(false)
    }

    fetchLocation()
  }, [])

  // Persiste en DB puis met à jour le state local immédiatement
  async function updateAndPersistLocation(newLocation: UserLocation): Promise<boolean> {
    const result = await updateUserLocation(newLocation)
    if (result.success) {
      setLocation(newLocation)
      return true
    }
    return false
  }

  return (
    <GeoContext.Provider value={{ location, isLoading, setLocation, updateAndPersistLocation }}>
      {children}
    </GeoContext.Provider>
  )
}

export function useGeo(): GeoContextValue {
  const ctx = useContext(GeoContext)
  if (!ctx) throw new Error('useGeo must be used within GeoProvider')
  return ctx
}
