'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type UserLocation = 'saint_pierre' | 'miquelon' | 'exterieur'

interface UseGeoLocationReturn {
  location: UserLocation | null
  isLoading: boolean
  updateLocation: (location: UserLocation) => Promise<void>
}

export function useGeoLocation(): UseGeoLocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLocation() {
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
  }, [supabase])

  const updateLocation = useCallback(async (newLocation: UserLocation) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ location: newLocation })
      .eq('id', user.id)

    if (!error) {
      setLocation(newLocation)
    }
  }, [supabase])

  return { location, isLoading, updateLocation }
}
