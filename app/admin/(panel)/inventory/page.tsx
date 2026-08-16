'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Minus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface VariantRow {
  id: string
  sku: string
  stock: number
  is_custom: boolean
  attributes: { size?: string; color?: string } | null
  products: { name: string } | null
}

interface MovementRow {
  id: string
  delta: number
  reason: string
  created_at: string
  product_variants: { sku: string } | null
}

export default function InventoryPage() {
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [movements, setMovements] = useState<MovementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [amounts, setAmounts] = useState<Record<string, number>>({})
  const [busyId, setBusyId] = useState<string | null>(null)

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const [v, m] = await Promise.all([
      supabase.from('product_variants').select('id, sku, stock, is_custom, attributes, products(name)').order('sku'),
      supabase.from('inventory_movements').select('id, delta, reason, created_at, product_variants(sku)').order('created_at', { ascending: false }).limit(10),
    ])
    setVariants((v.data ?? []) as unknown as VariantRow[])
    setMovements((m.data ?? []) as unknown as MovementRow[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const adjust = async (id: string, delta: number, reason: string) => {
    setBusyId(id)
    const { error } = await supabase.rpc('admin_adjust_stock', { variant_id: id, delta, reason } as never)
    if (error) alert(error.message)
    setBusyId(null)
    load()
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-2">Stock</p>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-espresso">
          Inven<span className="italic text-bronze">tory</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Variants */}
        <div className="lg:col-span-2 bg-ivory border border-sand p-6">
          <h2 className="text-xs uppercase tracking-[0.25em] text-espresso mb-6">All variants</h2>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-bronze" />
          ) : (
            <div className="space-y-3">
              {variants.map((v) => (
                <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 border border-sand px-4 py-3">
                  <div>
                    <p className="text-espresso text-sm">{v.products?.name ?? '—'} · {v.attributes?.size}{v.attributes?.color ? ` / ${v.attributes.color}` : ''}</p>
                    <p className="text-taupe text-xs">{v.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-serif text-lg w-10 text-right ${v.stock === 0 ? 'text-red-700' : v.stock <= 5 ? 'text-bronze' : 'text-espresso'}`}>
                      {v.stock}
                    </span>
                    {!v.is_custom && (
                      <>
                        <input
                          type="number"
                          min={1}
                          value={amounts[v.id] ?? 10}
                          onChange={(e) => setAmounts({ ...amounts, [v.id]: Number(e.target.value) })}
                          className="w-16 border border-sand bg-transparent px-2 py-1.5 text-xs text-espresso focus:border-bronze outline-none"
                        />
                        <button onClick={() => adjust(v.id, amounts[v.id] ?? 10, 'restock')} disabled={busyId === v.id}
                          className="p-1.5 bg-espresso text-ivory hover:bg-bronze transition-colors disabled:opacity-50" title="Restock">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => adjust(v.id, -1, 'adjustment')} disabled={busyId === v.id}
                          className="p-1.5 border border-sand text-taupe hover:border-red-700 hover:text-red-700 transition-colors disabled:opacity-50" title="Remove one">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Movement history */}
        <div className="bg-ivory border border-sand p-6">
          <h2 className="text-xs uppercase tracking-[0.25em] text-espresso mb-6">Latest movements</h2>
          <div className="space-y-3">
            {movements.map((m) => (
              <div key={m.id} className="flex justify-between text-xs">
                <div>
                  <p className="text-espresso">{m.product_variants?.sku}</p>
                  <p className="text-taupe">{m.reason} · {format(new Date(m.created_at), 'dd MMM, HH:mm')}</p>
                </div>
                <span className={m.delta < 0 ? 'text-red-700' : 'text-bronze'}>{m.delta > 0 ? `+${m.delta}` : m.delta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}