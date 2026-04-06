import Link from 'next/link'

interface HeroProps {
  activePolls: number
  totalVotes: number
  completedPolls: number
}

export default function Hero({ activePolls, totalVotes, completedPolls }: HeroProps) {
  return (
    // 🎨 Intent: hero section avec gradient subtil + radial glow océan en haut
    <section
      className="relative overflow-hidden -mx-5 px-5 pt-12 pb-10 sm:pt-16 sm:pb-14"
      style={{
        background: 'linear-gradient(180deg, #F5F7FA 0%, #EEF3FA 50%, #F5F7FA 100%)',
      }}
    >
      {/* 🎨 Intent: glow radial bleu — ambient light Apple-style */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(26,111,181,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-[640px] mx-auto text-center flex flex-col items-center gap-6">
        {/* 🎨 Intent: eyebrow pill avec point vert pulsant */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-pill)] text-xs font-medium"
          style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: 'var(--success)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }}
          />
          {activePolls} sondage{activePolls > 1 ? 's' : ''} en cours
        </div>

        {/* 🎨 Intent: titre Instrument Serif avec "l'archipel" en italic océan */}
        <h1
          className="leading-[1.05] tracking-[-1.5px]"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 6vw, 68px)',
            color: 'var(--text-primary)',
          }}
        >
          La voix de{' '}
          <em style={{ color: 'var(--ocean)', fontStyle: 'italic' }}>
            l&apos;archipel
          </em>
        </h1>

        {/* 🎨 Intent: sous-titre DM Sans light, text-secondary */}
        <p
          className="max-w-[480px] leading-relaxed"
          style={{
            fontWeight: 300,
            fontSize: '17px',
            color: 'var(--text-secondary)',
          }}
        >
          Donnez votre avis sur les sujets qui comptent pour Saint-Pierre-et-Miquelon. Chaque vote est géo-tagué.
        </p>

        {/* 🎨 Intent: duo de boutons — primary ocean + ghost outline */}
        <div className="flex items-center gap-3 mt-2">
          <Link
            href="#sondages"
            className="
              inline-flex items-center min-h-[44px] px-6 py-2.5
              rounded-[var(--radius-pill)] text-sm font-medium text-white
              transition-all duration-200 hover:-translate-y-[1px]
            "
            style={{
              background: 'var(--ocean)',
              boxShadow: '0 4px 16px rgba(26,111,181,0.25)',
            }}
          >
            Voir les sondages
          </Link>
          <Link
            href="/proposer"
            className="
              inline-flex items-center min-h-[44px] px-6 py-2.5
              rounded-[var(--radius-pill)] text-sm font-medium
              transition-all duration-200 hover:-translate-y-[1px]
              border
            "
            style={{
              borderColor: 'var(--border-strong)',
              color: 'var(--text-secondary)',
            }}
          >
            Proposer un sondage
          </Link>
        </div>

        {/* 🎨 Intent: stats bar — chiffres en Instrument Serif gros, labels petits */}
        <div
          className="flex items-center gap-8 sm:gap-12 mt-6 pt-6 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          {[
            { value: totalVotes, label: 'votes exprimés' },
            { value: completedPolls, label: 'sondages réalisés' },
            { value: activePolls, label: 'en cours' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="leading-none"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '32px',
                  color: 'var(--text-primary)',
                }}
              >
                {stat.value}
              </div>
              <div
                className="mt-1 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
