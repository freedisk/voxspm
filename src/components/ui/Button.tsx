'use client'

import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  isLoading?: boolean
}

// 🎨 Intent: boutons Apple-style — primary ocean shadow, ghost border subtil
const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--ocean)',
    color: 'var(--white)',
    boxShadow: '0 4px 16px rgba(26,111,181,0.25)',
  },
  secondary: {
    background: 'var(--white)',
    color: 'var(--text-primary)',
    border: '1.5px solid var(--border-strong)',
    boxShadow: 'var(--shadow-sm)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
  },
  danger: {
    background: 'var(--danger)',
    color: 'var(--white)',
    boxShadow: '0 4px 16px rgba(217,79,79,0.25)',
  },
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        min-h-[44px] px-5 py-2.5 rounded-[var(--radius-sm)]
        font-medium text-sm
        transition-all duration-200
        focus-visible:outline-2 focus-visible:outline-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:enabled:-translate-y-[1px]
        ${className}
      `}
      style={{
        ...variantStyles[variant],
        outlineColor: 'var(--ocean)',
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
