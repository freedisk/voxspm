import { createBrowserClient } from '@supabase/ssr'

// Singleton côté client — réutilisé par tous les Client Components
// Le SDK Supabase gère automatiquement la session via localStorage
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
