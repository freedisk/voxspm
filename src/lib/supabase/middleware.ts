import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rafraîchit la session Supabase à chaque requête (obligatoire pour SSR)
// et protège les routes /admin/* pour les non-admins
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Propager les cookies mis à jour dans la requête ET la réponse
          // Sans ça, le refresh token ne serait pas persisté correctement
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() rafraîchit le token si expiré — ne pas remplacer par getSession()
  // getSession() ne valide pas le JWT, getUser() fait un appel auth serveur
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protection /admin/* : vérifier le rôle dans la table profiles
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Vérifier le rôle admin dans profiles via la service-level query
    // RLS permet à chaque user de lire son propre profil (profiles_own_read)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
