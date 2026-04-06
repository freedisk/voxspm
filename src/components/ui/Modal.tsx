'use client'

import { useEffect, useCallback, type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Fermeture via Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Empêcher le scroll du body quand la modal est ouverte
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    // 🎨 Intent: overlay fixed plein écran, centrage flexbox
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      style={{
        background: 'rgba(10, 22, 40, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Modal centrée — stop propagation pour ne pas fermer au clic sur le contenu */}
      <div
        className="max-w-sm w-full mx-4 p-0"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="
                min-h-[44px] min-w-[44px] flex items-center justify-center
                rounded-[var(--radius-sm)] transition-colors duration-200
              "
              style={{ color: 'var(--text-muted)' }}
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
