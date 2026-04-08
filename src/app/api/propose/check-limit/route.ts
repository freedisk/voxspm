export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MAX_PENDING_PROPOSALS } from '@/lib/constants'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ canPropose: true, pendingCount: 0 })
    }

    const { count, error } = await supabase
      .from('polls')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des propositions' },
        { status: 500 }
      )
    }

    const canPropose = (count ?? 0) < MAX_PENDING_PROPOSALS

    return NextResponse.json({ canPropose, pendingCount: count ?? 0 })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
