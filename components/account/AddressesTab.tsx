'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Address {
  id: string
  label: string | null
  full_name: string
  phone: string
  address: string
  city: string
  is_default: boolean
}

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot', 'Other']

export default function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: '', full_name: '', phone: '', address: '', city: '' })
  const [busy, setBusy] = useState(false)

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('addresses').select('*').order('created_at')
    setAddresses((data ?? []) as Address[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    await supabase.from('addresses').insert({ ...form, is_default: addresses.length === 0 })
    setBusy(false)
    setShowForm(false)
    setForm({ label: '', full_name: '', phone: '', address: '', city: '' })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Remove this address?')) return
    await supabase.from('addresses').delete().eq('id', id)
    load()
  }

  const makeDefault = async (id: string) => {
    await supabase.from('addresses').update({ is_default: false }).neq('id', id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    load()
  }

  const inputCls = 'w-full bg-transparent border border-sand px-4 py-3 text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors'
  const labelCls = 'block text-[10px] uppercase tracking-[0.25em] text-taupe mb-2'

  return (
    <div className="space-y-6">
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-espresso text-ivory px-6 py-3 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New address'}
      </button>

      {showForm && (
        <form onSubmit={save} className="bg-ivory border border-sand p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full name</label>
              <input className={inputCls} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>City</label>
              <select className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required>
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Label (optional)</label>
              <input className={inputCls} placeholder="Home / Office" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={busy} className="bg-espresso text-ivory px-6 py-3 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors disabled:opacity-50">
            Save address
          </button>
        </form>
      )}

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-bronze" />
      ) : addresses.length === 0 ? (
        <p className="font-serif italic text-taupe">No saved addresses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="bg-ivory border border-sand p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-espresso text-sm font-medium">
                  {a.label || 'Address'}
                  {a.is_default && <span className="ml-2 text-[9px] uppercase tracking-[0.2em] bg-bronze text-ivory px-2 py-0.5">Default</span>}
                </p>
                <button onClick={() => remove(a.id)} className="text-taupe hover:text-red-700 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-taupe text-sm">{a.full_name} · {a.phone}</p>
              <p className="text-taupe text-sm">{a.address}, {a.city}</p>
              {!a.is_default && (
                <button onClick={() => makeDefault(a.id)} className="mt-3 text-[10px] uppercase tracking-[0.2em] text-bronze hover:text-espresso transition-colors">
                  Make default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}