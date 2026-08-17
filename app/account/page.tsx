'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Package, MapPin, Star, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import OrdersTab from '@/components/account/OrdersTab'
import AddressesTab from '@/components/account/AddressesTab'
import ReviewsTab from '@/components/account/ReviewsTab'
import ProfileTab from '@/components/account/ProfileTab'

const TABS = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'profile', label: 'Profile', icon: UserRound },
] as const

export default function AccountPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<string>('orders')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
        return
      }
      setReady(true)
    })
  }, [router])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-bronze" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pt-32 pb-24">
      <div className="flex items-end justify-between border-b border-sand pb-6 mb-10">
        <h1 className="font-serif text-4xl md:text-5xl text-espresso">Your Account</h1>
        <button onClick={signOut} className="flex items-center gap-2 text-taupe hover:text-bronze text-[10px] uppercase tracking-[0.2em] transition-colors">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 text-[10px] uppercase tracking-[0.25em] border transition-colors flex items-center gap-2 ${
              tab === t.id ? 'bg-espresso text-ivory border-espresso' : 'border-sand text-taupe hover:border-bronze hover:text-espresso'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && <OrdersTab />}
      {tab === 'addresses' && <AddressesTab />}
      {tab === 'reviews' && <ReviewsTab />}
      {tab === 'profile' && <ProfileTab />}
    </div>
  )
}