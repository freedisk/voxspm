'use client'

import { useState, useEffect, useRef } from 'react'
import { MessagesSquare, PenLine, Layers, ShieldCheck, CheckCircle2, Target, X } from 'lucide-react'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const ctaRef = useRef<HTMLButtonElement>(null)

  // Fermeture au clavier (Escape)
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus initial sur le CTA au montage
  useEffect(() => {
    if (isOpen) {
      ctaRef.current?.focus()
    }
  }, [isOpen])

  // Bloquer le scroll du body pendant que la modale est ouverte
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop — clic ne ferme pas */}
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-md animate-in fade-in duration-200" />

      {/* Surface — stopPropagation pour que le clic sur la surface ne remonte pas */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermeture */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contenu */}
        <div className="p-8 sm:p-10">

          {/* En-tête */}
          <h2
            id="welcome-title"
            className="font-['Instrument_Serif'] text-3xl sm:text-4xl text-slate-900 leading-tight"
          >
            Bienvenue sur VoxSPM
          </h2>
          <p className="mt-2 text-sm text-slate-600 italic">
            La voix libre de Saint-Pierre-et-Miquelon et de sa diaspora
          </p>

          {/* Intro */}
          <p className="mt-5 text-[15px] text-slate-700 leading-relaxed">
            VoxSPM est un espace citoyen où chacun peut proposer des sondages
            et exprimer son avis sur la vie de l&apos;archipel. Libre, ouvert, anonyme.
          </p>

          {/* Séparateur */}
          <div className="mt-6 h-px bg-slate-200" />

          {/* Grille des 6 blocs */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div className="flex gap-3">
              <MessagesSquare className="w-5 h-5 text-[#1A6FB5] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Libre et participatif</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Ouvert à tous, sans inscription. Un espace constructif pour partager
                  des idées et recueillir des avis sur ce qui compte pour l&apos;archipel.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <PenLine className="w-5 h-5 text-[#1A6FB5] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Chacun peut proposer</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  N&apos;importe qui peut soumettre un sondage raisonnable et éthique.
                  Une modération valide les propositions pour écarter celles qui sortent du cadre.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Layers className="w-5 h-5 text-[#1A6FB5] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Plusieurs sondages actifs</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Pas de limite hebdomadaire. Plusieurs sujets vivent en parallèle,
                  pour que chaque voix trouve sa place.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-[#1A6FB5] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Anonyme et sans compte</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Aucune inscription pour voter ou proposer. Ton avis reste anonyme —
                  seule ta géographie (Saint-Pierre, Miquelon, Extérieur) est enregistrée.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1A6FB5] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Un vote par sondage</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Tu peux voter une seule fois par sondage, mais tu peux participer
                  à tous les sondages actifs.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Target className="w-5 h-5 text-[#1A6FB5] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Simple et direct</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Une interface sobre qui va droit au but. Pas de pub, pas de distraction,
                  pas de manipulation — juste des questions et des réponses.
                </p>
              </div>
            </div>

          </div>

          {/* Note de bas */}
          <p className="mt-6 text-[11px] text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3">
            VoxSPM est un projet citoyen indépendant. Les résultats reflètent les
            opinions des participants et n&apos;ont pas valeur de sondage statistique officiel.
          </p>

          {/* CTA */}
          <button
            ref={ctaRef}
            onClick={onClose}
            className="mt-7 w-full bg-[#1A6FB5] hover:bg-[#155a94] text-white font-medium
                       rounded-full py-3 px-6 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-[#1A6FB5] focus:ring-offset-2"
          >
            J&apos;ai compris, je découvre →
          </button>

        </div>
      </div>
    </div>
  )
}
