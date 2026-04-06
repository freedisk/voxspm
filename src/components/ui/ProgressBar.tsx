interface ProgressBarProps {
  value: number
  color: string
  label: string
  count: number
  isLeader?: boolean
}

export default function ProgressBar({ value, color, label, count, isLeader = false }: ProgressBarProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span
          className={isLeader ? 'font-medium' : ''}
          style={{ color: isLeader ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          {label}
        </span>
        <span className="tabular-nums text-xs" style={{ color: 'var(--text-muted)' }}>
          {count} ({Math.round(value)}%)
        </span>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{
          height: isLeader ? '8px' : '6px',
          background: 'var(--surface-3)',
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            backgroundColor: color,
            transition: 'width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            animation: 'bar-fill 0.8s ease-out',
          }}
        />
      </div>
    </div>
  )
}
