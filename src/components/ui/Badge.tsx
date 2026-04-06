interface BadgeProps {
  label: string
  color: string
  icon?: string
}

export default function Badge({ label, color, icon }: BadgeProps) {
  return (
    // 🎨 Intent: pill coloré avec fond 10% de la couleur du tag
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-pill)] text-xs font-medium"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  )
}
