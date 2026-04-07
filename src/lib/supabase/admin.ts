import { createClient } from '@supabase/supabase-js'

// Client service role — bypass RLS, utilisé uniquement côté serveur (API Routes)
// JAMAIS exposer côté client
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
