interface BadgeProps {
  label: string
  color: string
  icon?: string
}

export default function Badge({ label, color, icon }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      // Couleur dynamique par tag — ne peut pas être une classe Tailwind statique
      style={{ backgroundColor: `${color}20`, color }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  )
}
