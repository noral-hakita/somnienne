'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Clock, Package, Truck, Boxes, Tags, Users, Store, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const items = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Pending Orders', icon: Clock, soon: true },
  { label: 'Orders', icon: Package, soon: true },
  { label: 'Shipments', icon: Truck, soon: true },
  { label: 'Inventory', icon: Boxes, soon: true },
  { label: 'Listings', icon: Tags, soon: true },
  { label: 'Employees', icon: Users, soon: true },
]

export default function Sidebar({ name, role }: { name: string; role: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 bg-ivory border-r border-sand">
        <div className="px-6 py-8 border-b border-sand">
          <p className="font-serif text-xl tracking-[0.2em] uppercase text-espresso">Somnienne</p>
          <p className="text-bronze text-[9px] uppercase tracking-[0.35em] mt-1">Atelier Console</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {items.map((item) =>
            item.soon ? (
              <span key={item.label} className="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-[0.15em] text-taupe/40 cursor-not-allowed">
                <item.icon className="w-4 h-4" /> {item.label}
                <span className="ml-auto text-[8px] tracking-[0.2em]">soon</span>
              </span>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors ${
                  pathname === item.href ? 'bg-espresso text-ivory' : 'text-espresso/70 hover:bg-linen'
                }`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            )
          )}
        </nav>
        <div className="px-6 py-6 border-t border-sand space-y-3">
          <p className="text-xs text-taupe">{name} · <span className="uppercase text-[10px] tracking-[0.15em] text-bronze">{role}</span></p>
          <Link href="/" className="flex items-center gap-2 text-xs text-espresso/70 hover:text-bronze transition-colors">
            <Store className="w-4 h-4" /> View boutique
          </Link>
          <button onClick={signOut} className="flex items-center gap-2 text-xs text-espresso/70 hover:text-bronze transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 h-16 bg-ivory border-b border-sand flex items-center gap-3 px-4 overflow-x-auto">
        <span className="font-serif tracking-[0.2em] uppercase text-espresso text-sm whitespace-nowrap">Somnienne</span>
        <Link href="/admin" className="text-[10px] uppercase tracking-[0.15em] bg-espresso text-ivory px-3 py-1.5 whitespace-nowrap">Dashboard</Link>
        <button onClick={signOut} className="text-[10px] uppercase tracking-[0.15em] text-taupe px-3 py-1.5 whitespace-nowrap">Sign out</button>
      </header>
    </>
  )
}