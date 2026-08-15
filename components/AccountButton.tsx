'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AccountButton() {
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

  if (!ready) return <div className="w-8 h-8" /> // placeholder, prevents layout jump

  if (!email) {
    return (
      <Link
        href="/login"
        className="text-xs uppercase tracking-[0.25em] text-espresso/70 hover:text-bronze transition-colors"
      >
        Sign in
      </Link>
    )
  }

  return (
    <button
      onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
      }}
      title="Sign out"
      className="w-8 h-8 rounded-full bg-espresso text-ivory text-xs uppercase flex items-center justify-center hover:bg-bronze transition-colors"
    >
      {email[0]}
    </button>
  )
}