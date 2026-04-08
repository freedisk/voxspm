'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="w-full mt-auto"
      style={{ background: '#0A1628', color: 'rgba(255,255,255,0.7)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Ligne principale */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
              style={{ background: 'linear-gradient(135deg, var(--ocean), var(--miq))' }}
            >
              🗳️
            </div>
            <div>
              <span
                className="text-lg text-white"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                VoxSPM
              </span>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                La voix de l&apos;archipel · Saint-Pierre-et-Miquelon
              </p>
            </div>
          </div>

          {/* Liens */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('voxspm:open-welcome'))}
              className="text-sm hover:text-white transition-colors duration-200"
            >
              À propos
            </button>
            <Link
              href="/proposer"
              className="text-sm hover:text-white transition-colors duration-200"
            >
              Proposer un sondage
            </Link>
            <Link
              href="/admin"
              className="text-xs transition-colors duration-200"
              style={{ opacity: 0.5 }}
            >
              Administration
            </Link>
          </div>
        </div>

        {/* Ligne bas */}
        <div
          className="mt-8 pt-6 border-t text-xs"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          © 2026 VoxSPM · Projet citoyen SPM
        </div>
      </div>
    </footer>
  )
}
