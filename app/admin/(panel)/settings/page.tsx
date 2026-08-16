'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const FIELDS = [
  { key: 'shipping_fee', label: 'Shipping fee (PKR)', hint: 'Flat nationwide rate' },
  { key: 'free_shipping_threshold', label: 'Free shipping over (PKR)', hint: 'Orders at or above this ship complimentary' },
  { key: 'low_stock_threshold', label: 'Low stock alert at', hint: 'Variants at or below this raise alerts' },
  { key: 'order_confirmation_hours', label: 'Confirmation window (hours)', hint: 'Pending orders auto-cancel after this' },
]

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.from('settings').select('key, value').then(({ data }) => {
      const map: Record<string, string> = {}
      ;(data ?? []).forEach((row: { key: string; value: unknown }) => {
        map[row.key] = String(row.value)
      })
      setValues(map)
      setLoading(false)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    setSaved(false)
    for (const f of FIELDS) {
      // Number() on purpose: jsonb must store a JSON number, not a string,
      // or the SQL casts (value::numeric) would break.
      await supabase.from('settings').update({ value: Number(values[f.key]) }).eq('key', f.key)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-2">Configuration</p>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-espresso">
          Set<span className="italic text-bronze">tings</span>
        </h1>
        <p className="text-taupe text-sm mt-2">
          These values feed the checkout display and the <code className="text-bronze">place_order</code> RPC instantly.
        </p>
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-bronze" />
      ) : (
        <div className="bg-ivory border border-sand p-6 space-y-6">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-taupe mb-2">{f.label}</label>
              <input
                type="number"
                value={values[f.key] ?? ''}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                className="w-full bg-transparent border border-sand px-4 py-3 text-espresso focus:border-bronze outline-none transition-colors"
              />
              <p className="text-taupe text-xs mt-1 italic">{f.hint}</p>
            </div>
          ))}

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-espresso text-ivory py-4 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved ✓' : 'Save settings'}
          </button>
        </div>
      )}
    </div>
  )
}