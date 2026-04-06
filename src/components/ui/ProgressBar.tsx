interface ProgressBarProps {
  value: number
  color: string
  label: string
  count: number
  isLeader?: boolean
}

export default function ProgressBar({ value, color, label, count, isLeader = false }: ProgressBarProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className={isLeader ? 'text-foreground font-semibold' : 'text-muted'}>
          {label}
        </span>
        <span className="text-muted tabular-nums">
          {count} ({Math.round(value)}%)
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          // Animation bar-fill définie dans globals.css
          style={{
            width: `${value}%`,
            backgroundColor: color,
            animation: 'bar-fill 0.8s ease-out',
          }}
        />
      </div>
    </div>
  )
}
