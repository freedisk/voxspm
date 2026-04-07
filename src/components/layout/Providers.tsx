'use client'

import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { SessionProvider } from '@/lib/context/SessionProvider'
import { GeoProvider, useGeo } from '@/lib/context/GeoContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GeoModal from '@/components/layout/GeoModal'

// Composant interne qui consomme le GeoContext — doit être enfant de GeoProvider
function AppShell({ children }: { children: ReactNode }) {
  const [geoModalOpen, setGeoModalOpen] = useState(false)
  const { location, isLoading } = useGeo()

  // Ouvrir automatiquement la GeoModal si location non définie (premier visiteur)
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {children}
      </main>
      <Footer />
    </>
  )
}

// Provider racine — SessionProvider crée la session anon, GeoProvider lit la localisation
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <GeoProvider>
        <AppShell>{children}</AppShell>
      </GeoProvider>
    </SessionProvider>
  )
}
