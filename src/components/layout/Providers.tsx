'use client'

import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import GeoModal from '@/components/layout/GeoModal'
import { useGeoLocation } from '@/lib/hooks/useGeoLocation'

// Provider client séparé du RootLayout (Server Component)
// Gère l'init auth anonyme + l'état du GeoModal partagé entre Header et contenu
export default function Providers({ children }: { children: ReactNode }) {
  const [geoModalOpen, setGeoModalOpen] = useState(false)
  const { location, isLoading } = useGeoLocation()
  const supabase = createClient()

  useEffect(() => {
    // Créer une session anonyme si aucune n'existe
    // Nécessaire pour que les RLS policies fonctionnent (auth.uid() non null)
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await supabase.auth.signInAnonymously()
      }
    }
    initAuth()
  }, [supabase])

  useEffect(() => {
    // Ouvrir le GeoModal automatiquement si location non définie
    if (!isLoading && location === null) {
      setGeoModalOpen(true)
    }
  }, [isLoading, location])

  const handleOpenGeoModal = useCallback(() => {
    setGeoModalOpen(true)
  }, [])

  const handleCloseGeoModal = useCallback(() => {
    setGeoModalOpen(false)
  }, [])

  return (
    <>
      <Header onOpenGeoModal={handleOpenGeoModal} />
      <GeoModal isOpen={geoModalOpen} onClose={handleCloseGeoModal} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </>
  )
}
