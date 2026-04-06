'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Email ou mot de passe incorrect')
      setIsLoading(false)
      return
    }

    // Le middleware vérifiera le rôle admin au prochain chargement
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ocean">VoxSPM</h1>
          <p className="text-sm text-muted mt-1">Administration</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-1 rounded-2xl p-6 border border-rock/20 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="
                w-full px-4 py-3 rounded-xl bg-surface-2 border border-rock/20
                text-foreground text-sm
                focus:outline-none focus:border-ocean min-h-[44px]
              "
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-muted">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="
                w-full px-4 py-3 rounded-xl bg-surface-2 border border-rock/20
                text-foreground text-sm
                focus:outline-none focus:border-ocean min-h-[44px]
              "
            />
          </div>

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full">
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  )
}
