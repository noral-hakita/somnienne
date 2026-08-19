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
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [showcaseId, setShowcaseId] = useState('')
  const [spotlightId, setSpotlightId] = useState('')
  const [spotlightEnds, setSpotlightEnds] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const [s, c, p] = await Promise.all([
        supabase.from('settings').select('key, value'),
        supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
        supabase.from('products').select('id, name').eq('is_active', true).order('name'),
      ])
      const map: Record<string, string> = {}
      ;(s.data ?? []).forEach((row: { key: string; value: unknown }) => {
        map[row.key] = String(row.value)
      })
      setValues(map)
      setShowcaseId(map['showcase_category_id'] ?? '')
      setSpotlightId(map['craft_product_id'] ?? '')
      setSpotlightEnds(map['spotlight_ends_at'] ?? '')
      setCategories((c.data ?? []) as { id: string; name: string }[])
      setProducts((p.data ?? []) as { id: string; name: string }[])
      setLoading(false)
    })()
  }, [])

  const flash = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const save = async () => {
    setSaving(true)
    for (const f of FIELDS) {
      await supabase.from('settings').update({ value: Number(values[f.key]) }).eq('key', f.key)
    }
    setSaving(false)
    flash()
  }

  const saveShowcase = async () => {
    setSaving(true)
    await supabase.from('settings').upsert({ key: 'showcase_category_id', value: showcaseId })
    setSaving(false)
    flash()
  }

  const saveSpotlight = async () => {
    setSaving(true)
    await supabase.from('settings').upsert([
      { key: 'craft_product_id', value: spotlightId },
      { key: 'spotlight_ends_at', value: spotlightEnds },
    ])
    setSaving(false)
    flash()
  }

  const inputCls = 'w-full bg-transparent border border-sand px-4 py-3 text-espresso focus:border-bronze outline-none transition-colors'

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-2">Configuration</p>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-espresso">
          Set<span className="italic text-bronze">tings</span>
        </h1>
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-bronze" />
      ) : (
        <>
          <div className="bg-ivory border border-sand p-6 space-y-6">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-taupe mb-2">{f.label}</label>
                <input
                  type="number"
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  className={inputCls}
                />
                <p className="text-taupe text-xs mt-1 italic">{f.hint}</p>
              </div>
            ))}
            <button
              onClick={save}
              disabled={saving}
              className="w-full bg-espresso text-ivory py-4 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {saved ? 'Saved ✓' : 'Save settings'}
            </button>
          </div>

          <div className="bg-ivory border border-sand p-6 space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-taupe mb-2">Home showcase category</label>
              <select value={showcaseId} onChange={(e) => setShowcaseId(e.target.value)} className={inputCls}>
                <option value="">— No showcase —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-taupe text-xs mt-1 italic">The 3D scroll stage on the landing page features this category's active products.</p>
            </div>
            <button
              onClick={saveShowcase}
              disabled={saving}
              className="w-full bg-espresso text-ivory py-4 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {saved ? 'Saved ✓' : 'Save showcase'}
            </button>
          </div>

          <div className="bg-espresso border border-espresso p-6 space-y-4">
            <p className="text-bronze text-[10px] uppercase tracking-[0.3em]">Spotlight · /craft</p>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-ivory/60 mb-2">Spotlight product</label>
              <select value={spotlightId} onChange={(e) => setSpotlightId(e.target.value)} className={inputCls}>
                <option value="">— No spotlight —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-ivory/60 mb-2">Discount ends at</label>
              <input
                type="datetime-local"
                value={spotlightEnds}
                onChange={(e) => setSpotlightEnds(e.target.value)}
                className={inputCls}
              />
            </div>
            <p className="text-ivory/40 text-xs italic">
              Set a Sale price on the product — that becomes the spotlight price with the retail struck through.
            </p>
            <button
              onClick={saveSpotlight}
              disabled={saving}
              className="w-full bg-bronze text-espresso py-4 text-xs uppercase tracking-[0.25em] font-medium hover:bg-ivory transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {saved ? 'Saved ✓' : 'Save spotlight'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}