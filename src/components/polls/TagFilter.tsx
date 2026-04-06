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
    // 🎨 Intent: barre scrollable sans scrollbar, pills Apple-style
    <div
      className="flex gap-2 overflow-x-auto pb-2"
      role="group"
      aria-label="Filtrer par thème"
      style={{ scrollbarWidth: 'none' }}
    >
      <button
        onClick={() => onToggle('__all__')}
        className="
          min-h-[44px] shrink-0 px-5 py-2 rounded-[var(--radius-pill)]
          text-sm font-medium border transition-all duration-200
        "
        style={isAllActive ? {
          background: 'var(--ocean)',
          color: 'var(--white)',
          borderColor: 'var(--ocean)',
          boxShadow: '0 2px 8px rgba(26,111,181,0.25)',
        } : {
          background: 'var(--white)',
          color: 'var(--text-secondary)',
          borderColor: 'var(--border-strong)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        Tous
      </button>

      {tags.map((tag) => {
        const isActive = activeTagSlugs.includes(tag.slug)
        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.slug)}
            className="
              min-h-[44px] shrink-0 px-5 py-2 rounded-[var(--radius-pill)]
              text-sm font-medium border transition-all duration-200
              flex items-center gap-1.5
            "
            style={isActive ? {
              background: tag.color,
              color: 'var(--white)',
              borderColor: tag.color,
              boxShadow: `0 2px 8px ${tag.color}40`,
            } : {
              background: 'var(--white)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-strong)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span>{tag.icon}</span>
            <span>{tag.name}</span>
          </button>
        )
      })}
    </div>
  )
}
