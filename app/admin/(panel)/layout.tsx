import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/admin/Sidebar'

const STAFF = ['owner', 'operations', 'support']

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active || !STAFF.includes(profile.role)) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen">
      <Sidebar name={profile.full_name ?? 'Staff'} role={profile.role} />
      <main className="md:pl-60 pt-16 md:pt-0">
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  )
}