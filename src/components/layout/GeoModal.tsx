'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { useGeoLocation } from '@/lib/hooks/useGeoLocation'

type UserLocation = 'saint_pierre' | 'miquelon' | 'exterieur'

const geoOptions: { value: UserLocation; emoji: string; label: string }[] = [
  { value: 'saint_pierre', emoji: '🏝️', label: 'Saint-Pierre' },
  { value: 'miquelon', emoji: '🌿', label: 'Miquelon' },
  { value: 'exterieur', emoji: '🌍', label: 'Je suis ailleurs' },
]

interface GeoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GeoModal({ isOpen, onClose }: GeoModalProps) {
  const { updateLocation } = useGeoLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSelect(location: UserLocation) {
    setIsSubmitting(true)
    await updateLocation(location)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="D'où participez-vous ?">
      <p className="text-sm text-muted mb-5">
        Votre localisation est utilisée pour afficher la répartition géographique des votes.
      </p>

      <div className="flex flex-col gap-2.5">
        {geoOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            disabled={isSubmitting}
            className="
              min-h-[44px] w-full flex items-center gap-3 px-4 py-3
              rounded-xl bg-surface-2 hover:bg-surface-3
              text-foreground text-sm font-medium
              border border-rock/20 hover:border-ocean/40
              transition-colors disabled:opacity-50
            "
          >
            <span className="text-xl">{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="
          w-full mt-4 py-2 text-sm text-muted hover:text-foreground
          transition-colors
        "
      >
        Plus tard
      </button>
    </Modal>
  )
}
