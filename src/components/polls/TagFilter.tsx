'use client'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

interface TagFilterProps {
  tags: Tag[]
  activeTagSlugs: string[]
  onToggle: (slug: string) => void
}

export default function TagFilter({ tags, activeTagSlugs, onToggle }: TagFilterProps) {
  const isAllActive = activeTagSlugs.length === 0

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
      role="group"
      aria-label="Filtrer par thème"
    >
      {/* "Tous" réinitialise les filtres — on vide activeTagSlugs dans le parent */}
      <button
        onClick={() => onToggle('__all__')}
        className={`
          min-h-[44px] shrink-0 px-4 py-2 rounded-full text-sm font-medium
          border transition-colors
          ${isAllActive
            ? 'bg-ocean text-white border-ocean'
            : 'bg-surface-2 text-muted border-rock/20 hover:border-ocean/40'
          }
        `}
      >
        Tous
      </button>

      {tags.map((tag) => {
        const isActive = activeTagSlugs.includes(tag.slug)
        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.slug)}
            className={`
              min-h-[44px] shrink-0 px-4 py-2 rounded-full text-sm font-medium
              border transition-colors flex items-center gap-1.5
              ${isActive
                ? 'text-white border-transparent'
                : 'bg-surface-2 text-muted border-rock/20 hover:border-ocean/40'
              }
            `}
            // Couleur dynamique du tag quand actif
            style={isActive ? { backgroundColor: tag.color, borderColor: tag.color } : undefined}
          >
            <span>{tag.icon}</span>
            <span>{tag.name}</span>
          </button>
        )
      })}
    </div>
  )
}
