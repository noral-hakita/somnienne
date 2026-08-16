'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STAFF = ['owner', 'operations', 'support']

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: p } = await supabase
        .from('profiles').select('role, is_active').eq('id', data.user.id).single()
      if (p && p.is_active && STAFF.includes(p.role)) router.replace('/admin')
    })
  }, [router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid credentials.')
      setBusy(false)
      return
    }
    const { data: p } = await supabase
      .from('profiles').select('role, is_active').eq('id', data.user.id).single()
    if (!p || !p.is_active || !STAFF.includes(p.role)) {
      await supabase.auth.signOut() // customers are bounced out, not let in
      setError('This area is for Somnienne staff only.')
      setBusy(false)
      return
    }
    router.push('/admin')
  }

  const inputCls =
    'w-full bg-transparent border border-ivory/20 px-4 py-3 text-ivory placeholder:text-ivory/30 focus:border-bronze outline-none transition-colors'

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] text-center mb-4">The Atelier</p>
        <h1 className="font-serif text-4xl font-light text-ivory text-center mb-10">
          Staff <span className="italic text-bronze">entrance</span>
        </h1>

        <form onSubmit={submit} className="space-y-5">
          <input className={inputCls} type="email" placeholder="Staff email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={inputCls} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-bronze text-espresso py-4 text-xs uppercase tracking-[0.25em] font-medium hover:bg-ivory transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enter the atelier'}
          </button>
        </form>

        <p className="text-center text-ivory/40 text-xs mt-8">
          No signup. Staff accounts are created by the owner, in the database.
        </p>
        <p className="text-center mt-4">
          <Link href="/" className="text-ivory/50 hover:text-bronze text-xs uppercase tracking-[0.2em] transition-colors">
            ← Back to the boutique
          </Link>
        </p>
      </div>
    </div>
  )
}