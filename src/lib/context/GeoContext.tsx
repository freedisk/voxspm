'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

type UserLocation = 'saint_pierre' | 'miquelon' | 'exterieur'

interface GeoContextValue {
  location: UserLocation | null
  isLoading: boolean
  setLocation: (location: UserLocation) => void
  updateAndPersistLocation: (location: UserLocation) => Promise<boolean>
}

const GeoContext = createContext<GeoContextValue | null>(null)

// Persist en DB via le client browser — pas de Server Action
// Le profil existe déjà (créé par le trigger handle_new_user) → update suffit
async function persistLocation(userId: string, loc: UserLocation) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ location: loc })
    .eq('id', userId)

  if (error) {
    console.error('persistLocation failed:', error)
  }
}

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

  // Optimistic update : state local d'abord, puis persist DB en background
  // La modal se ferme immédiatement — pas de blocage UX
  async function updateAndPersistLocation(newLocation: UserLocation): Promise<boolean> {
    setLocation(newLocation)

    // Fire-and-forget : persist en background via client direct
    persistInBackground(newLocation)

    return true
  }

  async function persistInBackground(newLocation: UserLocation) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await persistLocation(user.id, newLocation)
      }
    } catch (e) {
      console.error('GeoContext update failed:', e)
    }
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
