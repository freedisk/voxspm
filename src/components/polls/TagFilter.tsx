'use client'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
  order_index: number
  active_polls_count: number
}

interface TagFilterProps {
  tags: Tag[]
  activeTagSlugs: string[]
  onToggle: (slug: string) => void
}

export default function TagFilter({ tags, activeTagSlugs, onToggle }: TagFilterProps) {
  const isAllActive = activeTagSlugs.length === 0

  // Classes communes à tous les boutons
  const btnBase = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all'
  // Inactif : fond blanc, bordure fine slate, texte sombre
  const btnInactive = `${btnBase} bg-white border border-slate-200 text-slate-700 hover:border-slate-300`
  // Actif : contour bleu #1A6FB5 épais, fond blanc (géo-couleur SP réutilisée pour l'UI globale)
  const btnActive = `${btnBase} border-2 border-[#1A6FB5] bg-white text-[#1A6FB5]`

  return (
    // 🎨 Intent: barre compacte centrée, "Tous" isolé à gauche via séparateur
    <div
      className="flex flex-wrap items-center justify-center gap-1.5 max-w-5xl mx-auto px-4"
      role="group"
      aria-label="Filtrer par thème"
    >
      {/* Bouton Tous isolé */}
      <button
        onClick={() => onToggle('__all__')}
        className={isAllActive ? btnActive : btnInactive}
      >
        Tous
      </button>

      {/* Séparateur vertical entre "Tous" et les tags thématiques */}
      <div className="h-6 w-px bg-slate-300 mx-2" aria-hidden="true" />

      {/* Tags triés côté serveur (active_polls_count desc → order_index → name) */}
      {tags.map((tag) => {
        const isActive = activeTagSlugs.includes(tag.slug)
        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.slug)}
            className={isActive ? btnActive : btnInactive}
          >
            <span>{tag.icon}</span>
            <span>{tag.name}</span>
          </button>
        )
      })}
    </div>
  )
}
