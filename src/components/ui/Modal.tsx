'use client'

import { useEffect, useRef, useCallback, type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const handleNativeClose = useCallback(() => {
    if (isOpen) onClose()
  }, [isOpen, onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.addEventListener('close', handleNativeClose)
    return () => dialog.removeEventListener('close', handleNativeClose)
  }, [handleNativeClose])

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    // 🎨 Intent: overlay sombre bleuté + backdrop-blur, carte blanche radius-lg
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="max-w-[420px] w-[calc(100%-2rem)] p-0 border-0"
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
      }}
    >
      <style>{`
        dialog::backdrop {
          background: rgba(10, 22, 40, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>
      {isOpen && (
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
      )}
    </dialog>
  )
}
