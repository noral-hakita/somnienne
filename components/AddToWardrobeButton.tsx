'use client'

import { useMemo, useState } from 'react'
import { useWardrobeStore } from '@/store/wardrobeStore'
import type { StoreProduct } from '@/lib/api/products'

export default function AddToWardrobeButton({ product }: { product: StoreProduct }) {
  const addItem = useWardrobeStore((s) => s.addItem)
  const variants = product.variants ?? []

  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants])
  const colors = useMemo(
    () => [...new Set(variants.filter((v) => !v.isCustom).map((v) => v.color))],
    [variants]
  )

  const [size, setSize] = useState<string>(sizes.find((s) => s !== 'Custom') ?? sizes[0] ?? '')
  const [color, setColor] = useState<string>(colors[0] ?? '')
  const [notes, setNotes] = useState('')
  const [added, setAdded] = useState(false)

  const isCustom = size === 'Custom'
  const selected = isCustom
    ? variants.find((v) => v.isCustom)
    : variants.find((v) => v.size === size && v.color === color)

  const hasOptions = variants.length > 1

  const handleAdd = () => {
    if (!selected || selected.stock <= 0) return
    addItem({
      id: product.id,
      variantId: selected.id,
      name: product.name,
      price: product.price,
       image: product.images[0] ?? product.imageGradient,
      attributes: isCustom ? 'Custom size' : `${size} · ${color}`,
      customNotes: isCustom && notes ? notes : undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const optCls = (active: boolean) =>
    `px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-colors ${
      active
        ? 'bg-espresso text-ivory border-espresso'
        : 'border-sand text-taupe hover:border-bronze hover:text-espresso'
    }`

  if (variants.length === 0) {
    return (
      <button disabled className="w-full bg-sand text-taupe px-4 py-4 text-[10px] uppercase tracking-[0.2em] cursor-not-allowed">
        Currently unavailable
      </button>
    )
  }

  return (
    <div className="space-y-6">
      {hasOptions && (
        <>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-taupe mb-3">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={optCls(size === s)}>
                  {s === 'Custom' ? 'Custom (made to order)' : s}
                </button>
              ))}
            </div>
            {isCustom && (
              <p className="text-bronze text-xs mt-3 italic">
                Custom pieces are stitched for you — adds {product.customLeadTimeDays} days to delivery.
              </p>
            )}
          </div>

          {!isCustom && colors.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-taupe mb-3">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={optCls(color === c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isCustom && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-taupe mb-3">Your measurements (optional)</p>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Chest, waist, length… anything our tailors should know"
                className="w-full bg-transparent border border-sand px-4 py-3 text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors resize-none"
              />
            </div>
          )}

          {selected && !isCustom && (
            selected.stock <= 0 ? (
              <p className="text-red-700 text-xs">This combination is sold out.</p>
            ) : selected.stock <= 5 ? (
              <p className="text-bronze text-xs">Only {selected.stock} left in this combination.</p>
            ) : (
              <p className="text-taupe text-xs">In stock — ready to ship.</p>
            )
          )}
        </>
      )}

      <button
        onClick={handleAdd}
        disabled={!selected || selected.stock <= 0}
        className="w-full bg-espresso hover:bg-bronze text-ivory border border-espresso hover:border-bronze px-4 py-4 text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {added ? 'Added to your Wardrobe ✓' : 'Add to Wardrobe'}
      </button>
    </div>
  )
}