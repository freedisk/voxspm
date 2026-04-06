'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ReactNode } from 'react'

interface AdminShellProps {
  email: string
  children: ReactNode
}

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/tags', label: 'Tags' },
]

export default function AdminShell({ email, children }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Nav admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-1 rounded-xl p-4 border border-rock/20">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-warning">Admin</span>
          <nav className="flex gap-1">
            {navItems.map((item) => {
              // Match exact pour Dashboard, prefix pour les sous-pages
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-3 py-1.5 rounded-md text-sm transition-colors
                    ${isActive
                      ? 'bg-ocean text-white'
                      : 'text-muted hover:text-foreground hover:bg-surface-2'
                    }
                  `}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted truncate max-w-[180px]">{email}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-muted hover:text-danger transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}
