import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Lire le pathname depuis le header x-next-url injecté par le middleware
  // Next.js ne fournit pas le pathname dans les layouts serveur autrement
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  // La page login ne doit pas être protégée par ce layout
  // Le middleware gère déjà le redirect si admin connecté va sur /login
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin/login')

  return (
    <AdminShell email={user.email ?? 'Admin'}>
      {children}
    </AdminShell>
  )
}
