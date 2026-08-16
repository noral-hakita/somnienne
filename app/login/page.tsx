'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import GoogleButton from '@/components/GoogleButton'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
      <div className="w-full max-w-md">
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] text-center mb-4">
          Welcome back
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-espresso text-center mb-10">
          Sign <span className="italic text-bronze">in</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-[10px] uppercase tracking-[0.25em] text-taupe mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent border border-sand px-4 py-3 text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-[10px] uppercase tracking-[0.25em] text-taupe mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent border border-sand px-4 py-3 text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-espresso text-ivory py-4 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
          </button>
        </form>
        <div className="my-8 flex items-center gap-4">
          <span className="flex-1 h-px bg-sand" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-taupe">or</span>
          <span className="flex-1 h-px bg-sand" />
        </div>
        <GoogleButton />

        <p className="text-center text-sm text-taupe mt-8">
          New to Somnienne?{' '}
          <Link href="/signup" className="text-espresso underline underline-offset-4 hover:text-bronze transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}