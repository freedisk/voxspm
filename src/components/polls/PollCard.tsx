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
    <Link
      href={`/poll/${slug}`}
      className="
        block p-5 rounded-xl bg-surface-1 border border-rock/20
        hover:border-ocean/30 transition-colors group
      "
    >
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag) => (
            <Badge key={tag.id} label={tag.name} color={tag.color} icon={tag.icon} />
          ))}
        </div>
      )}

      {/* Question */}
      <h2 className="text-base font-semibold text-foreground group-hover:text-ocean-light transition-colors mb-3 line-clamp-2">
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

      {/* Meta */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted">
        <span>{proposer_name ?? 'Anonyme'}</span>
        <span>{date}</span>
      </div>
    </Link>
  )
}
