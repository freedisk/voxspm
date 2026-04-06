import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import GeoBreakdown from '@/components/polls/GeoBreakdown'

interface PollTag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

interface PollCardProps {
  slug: string
  question: string
  total_votes: number
  proposed_at: string
  proposer_name: string | null
  tags: PollTag[]
  votes_sp: number
  votes_miq: number
  votes_ext: number
}

export default function PollCard({
  slug,
  question,
  total_votes,
  proposed_at,
  proposer_name,
  tags,
  votes_sp,
  votes_miq,
  votes_ext,
}: PollCardProps) {
  const date = new Date(proposed_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })

  return (
    // 🎨 Intent: card blanche avec accent line dégradé au hover, lift Apple-style
    <Link
      href={`/poll/${slug}`}
      className="
        poll-card-hover
        relative block overflow-hidden
        rounded-[var(--radius-lg)] border
        group
        hover:-translate-y-[3px]
      "
      style={{
        background: 'var(--white)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* 🎨 Intent: accent line 3px dégradé ocean→miq, visible au hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, var(--ocean), var(--miq))' }}
      />

      <div className="p-5 sm:p-6">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag) => (
              <Badge key={tag.id} label={tag.name} color={tag.color} icon={tag.icon} />
            ))}
          </div>
        )}

        {/* 🎨 Intent: question en DM Sans 500, tracking tight */}
        <h2
          className="font-medium leading-snug mb-4 line-clamp-2 group-hover:text-ocean transition-colors duration-200"
          style={{
            fontSize: '15.5px',
            letterSpacing: '-0.2px',
            color: 'var(--text-primary)',
          }}
        >
          {question}
        </h2>

        {/* Geo breakdown compact */}
        <GeoBreakdown
          votes_sp={votes_sp}
          votes_miq={votes_miq}
          votes_ext={votes_ext}
          total_votes={total_votes}
          variant="compact"
        />

        {/* 🎨 Intent: footer avec meta + badge live animé */}
        <div
          className="flex items-center justify-between mt-4 pt-3 border-t text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <span>{proposer_name ?? 'Anonyme'} · {date}</span>
          <div className="flex items-center gap-2">
            <span className="tabular-nums">{total_votes} vote{total_votes > 1 ? 's' : ''}</span>
            {total_votes > 0 && (
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'var(--success)',
                    animation: 'pulse-dot 2s ease-in-out infinite',
                  }}
                />
                <span style={{ color: 'var(--success)' }}>Live</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
