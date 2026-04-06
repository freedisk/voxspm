'use client'

import Link from 'next/link'
import { useGeo } from '@/lib/context/GeoContext'

const locationLabels: Record<string, { short: string; emoji: string }> = {
  saint_pierre: { short: 'Saint-Pierre', emoji: '🏝️' },
  miquelon: { short: 'Miquelon', emoji: '🌿' },
  exterieur: { short: 'Extérieur', emoji: '🌍' },
}

interface HeaderProps {
  onOpenGeoModal: () => void
}

export default function Header({ onOpenGeoModal }: HeaderProps) {
  const { location, isLoading } = useGeo()
  const loc = location ? locationLabels[location] : null

  return (
    // 🎨 Intent: header glassmorphism léger, Apple-style avec fond translucide
    <header
      className="sticky top-0 z-[100] border-b"
      style={{
        background: 'rgba(245, 247, 250, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between">
        {/* 🎨 Intent: logo icône dans carré dégradé + typo Instrument Serif */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ background: 'linear-gradient(135deg, var(--ocean), var(--miq))' }}
          >
            🗳️
          </div>
          <span
            className="text-xl tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
          >
            VoxSPM
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* 🎨 Intent: pill géo cliquable — affiche la localisation actuelle */}
          <button
            onClick={onOpenGeoModal}
            className="
              min-h-[44px] flex items-center gap-1.5 px-3 py-1.5
              rounded-[var(--radius-pill)] text-sm transition-all duration-200
              border hover:shadow-sm
            "
            style={{
              borderColor: 'var(--border-strong)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Changer ma localisation"
          >
            {isLoading ? (
              <span style={{ color: 'var(--text-muted)' }}>...</span>
            ) : loc ? (
              <>
                <span>{loc.emoji}</span>
                <span className="hidden sm:inline text-xs font-medium">{loc.short}</span>
              </>
            ) : (
              <>
                <span>📍</span>
                <span className="hidden sm:inline text-xs">Localisation</span>
              </>
            )}
          </button>

          {/* 🎨 Intent: bouton CTA pill sombre, micro hover lift Apple-style */}
          <Link
            href="/proposer"
            className="
              hidden sm:flex items-center min-h-[44px] px-5 py-2
              rounded-[var(--radius-pill)] text-sm font-medium
              text-white transition-all duration-200
              hover:-translate-y-[1px]
            "
            style={{
              background: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Proposer
          </Link>
        </div>
      </div>
    </header>
  )
}
