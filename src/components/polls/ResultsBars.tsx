import ProgressBar from '@/components/ui/ProgressBar'

interface Option {
  id: string
  text: string
  votes_count: number
}

interface ResultsBarsProps {
  options: Option[]
  total_votes: number
}

export default function ResultsBars({ options, total_votes }: ResultsBarsProps) {
  // Identifier le leader pour le highlight
  const maxVotes = Math.max(...options.map((o) => o.votes_count))

  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const pct = total_votes > 0 ? (option.votes_count / total_votes) * 100 : 0
        const isLeader = option.votes_count > 0 && option.votes_count === maxVotes

        return (
          <ProgressBar
            key={option.id}
            value={pct}
            color={isLeader ? '#1B7FC4' : '#4B5F7C'}
            label={option.text}
            count={option.votes_count}
            isLeader={isLeader}
          />
        )
      })}
    </div>
  )
}
