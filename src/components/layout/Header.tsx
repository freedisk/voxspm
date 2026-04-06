'use client'

import Link from 'next/link'
import { useGeoLocation } from '@/lib/hooks/useGeoLocation'

const locationLabels: Record<string, { short: string; emoji: string }> = {
  saint_pierre: { short: 'SP', emoji: '🏝️' },
  miquelon: { short: 'Miq', emoji: '🌿' },
  exterieur: { short: 'Ext', emoji: '🌍' },
}

interface HeaderProps {
  onOpenGeoModal: () => void
}

export default function Header({ onOpenGeoModal }: HeaderProps) {
  const { location, isLoading } = useGeoLocation()

  const loc = location ? locationLabels[location] : null

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-rock/20">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-ocean">VoxSPM</span>
          <span className="text-xs text-muted hidden sm:inline">La voix de l'archipel</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/proposer"
            className="text-sm text-ocean hover:text-ocean-light transition-colors"
          >
            Proposer
          </Link>

          {/* Indicateur localisation — cliquable pour changer */}
          <button
            onClick={onOpenGeoModal}
            className="
              min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5
              text-sm rounded-lg hover:bg-surface-2 transition-colors px-2
            "
            aria-label="Changer ma localisation"
          >
            {isLoading ? (
              <span className="text-muted">...</span>
            ) : loc ? (
              <>
                <span>{loc.emoji}</span>
                <span className="text-muted">{loc.short}</span>
              </>
            ) : (
              <span className="text-warning">📍</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
