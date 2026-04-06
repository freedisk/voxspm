'use client'

import { useEffect, useRef, type ReactNode } from 'react'

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

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    // Fermeture via Escape — géré nativement par <dialog>, on sync l'état React
    const dialog = dialogRef.current
    if (!dialog) return

    function handleClose() {
      onClose()
    }

    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      // ::backdrop est stylé via le pseudo-élément natif de <dialog>
      className="
        bg-surface-1 text-foreground rounded-2xl p-6 max-w-md w-[calc(100%-2rem)]
        border border-rock/30 shadow-xl
        backdrop:bg-black/60 backdrop:backdrop-blur-sm
      "
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="
            min-h-[44px] min-w-[44px] flex items-center justify-center
            text-muted hover:text-foreground rounded-lg hover:bg-surface-2
            transition-colors
          "
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
      {children}
    </dialog>
  )
}
