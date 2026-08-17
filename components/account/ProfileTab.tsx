'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ProfileTab() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.from('profiles').select('full_name, phone').single().then(({ data }) => {
      setFullName(data?.full_name ?? '')
      setPhone(data?.phone ?? '')
      setLoading(false)
    })
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', (await supabase.auth.getUser()).data.user?.id)
    if (error) alert(error.message)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-bronze" />

  const inputCls = 'w-full bg-transparent border border-sand px-4 py-3 text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors'
  const labelCls = 'block text-[10px] uppercase tracking-[0.25em] text-taupe mb-2'

  return (
    <form onSubmit={save} className="bg-ivory border border-sand p-6 max-w-md space-y-4">
      <div>
        <label className={labelCls}>Full name</label>
        <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Phone (WhatsApp)</label>
        <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" />
      </div>
      <p className="text-taupe text-xs italic">Email is managed by your login and cannot be changed here.</p>
      <button type="submit" disabled={saving} className="w-full bg-espresso text-ivory py-3 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? 'Saved ✓' : 'Save changes'}
      </button>
    </form>
  )
}