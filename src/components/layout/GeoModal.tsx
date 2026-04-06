'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { useGeo } from '@/lib/context/GeoContext'

type UserLocation = 'saint_pierre' | 'miquelon' | 'exterieur'

const geoOptions: {
  value: UserLocation
  emoji: string
  label: string
  subtitle: string
  hoverColor: string
}[] = [
  { value: 'saint_pierre', emoji: '🏝️', label: 'Saint-Pierre', subtitle: 'Je vis à Saint-Pierre', hoverColor: '#1A6FB5' },
  { value: 'miquelon', emoji: '🌿', label: 'Miquelon', subtitle: 'Je vis à Miquelon-Langlade', hoverColor: '#0C9A78' },
  { value: 'exterieur', emoji: '🌍', label: 'Ailleurs', subtitle: 'Je suis de la diaspora SPM', hoverColor: '#6B4FA0' },
]

interface GeoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GeoModal({ isOpen, onClose }: GeoModalProps) {
  const { updateAndPersistLocation } = useGeo()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSelect(location: UserLocation) {
    setIsSubmitting(true)
    // Persiste en DB + sync le context immédiatement → Header se met à jour
    const success = await updateAndPersistLocation(location)
    setIsSubmitting(false)
    if (success) onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="D'où participez-vous ?">
      <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
        Votre localisation est utilisée pour la répartition géographique des votes.
      </p>

      {/* 🎨 Intent: 3 choix avec emoji + titre + sous-titre, hover coloré par zone */}
      <div className="flex flex-col gap-2.5">
        {geoOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            disabled={isSubmitting}
            className="
              min-h-[44px] w-full flex items-center gap-4 px-4 py-4
              rounded-[var(--radius-sm)] text-left
              border transition-all duration-200
              disabled:opacity-50
            "
            style={{
              borderColor: 'var(--border-strong)',
              background: 'var(--white)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = opt.hoverColor
              e.currentTarget.style.background = `${opt.hoverColor}08`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.background = 'var(--white)'
            }}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {opt.label}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {opt.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 🎨 Intent: lien texte underline discret */}
      <button
        onClick={onClose}
        className="w-full mt-5 py-2 text-sm underline transition-colors duration-200"
        style={{ color: 'var(--text-muted)' }}
      >
        Plus tard
      </button>
    </Modal>
  )
}
