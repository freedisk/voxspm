'use client'

import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import GeoModal from '@/components/layout/GeoModal'
import { useGeoLocation } from '@/lib/hooks/useGeoLocation'

export default function Providers({ children }: { children: ReactNode }) {
  const [geoModalOpen, setGeoModalOpen] = useState(false)
  const { location, isLoading } = useGeoLocation()
  const supabase = createClient()

  useEffect(() => {
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await supabase.auth.signInAnonymously()
      }
    }
    initAuth()
  }, [supabase])

  useEffect(() => {
    if (!isLoading && location === null) {
      setGeoModalOpen(true)
    }
  }, [isLoading, location])

  const handleOpenGeoModal = useCallback(() => setGeoModalOpen(true), [])
  const handleCloseGeoModal = useCallback(() => setGeoModalOpen(false), [])

  return (
    <>
      <Header onOpenGeoModal={handleOpenGeoModal} />
      <GeoModal isOpen={geoModalOpen} onClose={handleCloseGeoModal} />
      {/* 🎨 Intent: contenu principal centré max-width 960px, fond off-white */}
      <main className="flex-1 w-full max-w-[960px] mx-auto px-5 pb-8">
        {children}
      </main>
    </>
  )
}
