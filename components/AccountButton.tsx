'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AccountButton() {
  const pathname = usePathname()
  const dark = pathname.startsWith('/craft')
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
      setReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!ready) return <div className="w-8 h-8" />

  if (!email) {
    return (
      <Link
        href="/login"
        className={`text-xs uppercase tracking-[0.25em] transition-colors ${
          dark ? 'text-ivory/70 hover:text-bronze' : 'text-espresso/70 hover:text-bronze'
        }`}
      >
        Sign in
      </Link>
    )
  }

  return (
    <Link
      href="/account"
      title="Your account"
      className={`w-8 h-8 rounded-full text-xs uppercase flex items-center justify-center transition-colors ${
        dark ? 'bg-ivory text-espresso hover:bg-bronze hover:text-ivory' : 'bg-espresso text-ivory hover:bg-bronze'
      }`}
    >
      {email[0]}
    </Link>
  )
}