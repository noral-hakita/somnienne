'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useWardrobeStore } from '@/store/wardrobeStore'
import type { StoreProduct } from '@/lib/api/products'

export default function ProductDetail({ product }: { product: StoreProduct }) {
  const addItem = useWardrobeStore((s) => s.addItem)
  const variants = product.variants ?? []

  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants])
  const colors = useMemo(
    () => [...new Set(variants.filter((v) => !v.isCustom).map((v) => v.color))],
    [variants]
  )

  const [size, setSize] = useState(sizes.find((s) => s !== 'Custom') ?? sizes[0] ?? '')
  const [color, setColor] = useState(colors[0] ?? '')
  const [notes, setNotes] = useState('')
  const [added, setAdded] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  const isCustom = size === 'Custom'
  const selected = isCustom
    ? variants.find((v) => v.isCustom)
    : variants.find((v) => v.size === size && v.color === color)

  // ─── Color-linked gallery with graceful fallback ───
  const tagged = product.media.filter((m) => m.color && m.color === color)
  const fallback = product.media.filter((m) => !m.color)
  const gallery = (tagged.length > 0 ? tagged : fallback.length > 0 ? fallback : product.media).map((m) => m.url)
  const safeActive = Math.min(activeImg, Math.max(gallery.length - 1, 0))
  const mainImage = gallery[safeActive]

  const hasOptions = variants.length > 1

  const handleAdd = () => {
    if (!selected || selected.stock <= 0) return
    addItem({
      id: product.id,
      variantId: selected.id,
      name: product.name,
      price: product.price,
      image: mainImage ?? product.images[0] ?? product.imageGradient,
      attributes: isCustom ? 'Custom size' : `${size} · ${color}`,
      customNotes: isCustom && notes ? notes : undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const optCls = (active: boolean) =>
    `px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-colors ${
      active ? 'bg-espresso text-ivory border-espresso' : 'border-sand text-taupe hover:border-bronze hover:text-espresso'
    }`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
      {/* ─── Gallery ─── */}
      <div className="sticky top-24 space-y-3 self-start">
        <div className="aspect-[3/4] bg-linen overflow-hidden relative">
          {mainImage ? (
            <Image src={mainImage} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${product.imageGradient}`} />
          )}
        </div>
        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gallery.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImg(i)}
                className={`relative w-16 h-20 flex-shrink-0 overflow-hidden border-2 transition-colors ${
                  i === safeActive ? 'border-bronze' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Info ── */}
      <div className="flex flex-col">
        <p className="text-bronze text-[10px] md:text-xs uppercase tracking-[0.4em] mb-4">
          {product.categoryName ?? 'The Collection'}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-espresso leading-tight">{product.name}</h1>
        <p className="font-serif text-2xl text-espresso/80 mt-4 mb-8">Rs. {product.price.toLocaleString()}</p>
        <p className="text-taupe text-base leading-relaxed mb-10">{product.fullDescription}</p>

        {hasOptions && (
          <>
            <div className="mb-6">
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
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.25em] text-taupe mb-3">Color</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setColor(c); setActiveImg(0) }}
                      className={optCls(color === c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isCustom && (
              <div className="mb-6">
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
                <p className="text-red-700 text-xs mb-4">This combination is sold out.</p>
              ) : selected.stock <= 5 ? (
                <p className="text-bronze text-xs mb-4">Only {selected.stock} left in this combination.</p>
              ) : (
                <p className="text-taupe text-xs mb-4">In stock — ready to ship.</p>
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

        <div className="mt-12 border-t border-sand">
          <div className="py-6 border-b border-sand">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-espresso font-medium mb-2">Materials & Care</h3>
            <p className="text-taupe text-sm leading-relaxed">
              {product.careInstructions ?? 'Premium fabric blend. Machine wash cold on gentle cycle. Tumble dry low or hang to dry.'}
            </p>
          </div>
          <div className="py-6 border-b border-sand">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-espresso font-medium mb-2">Shipping & Returns</h3>
            <p className="text-taupe text-sm leading-relaxed">
              Complimentary shipping on orders over Rs. 15,000. Easy returns within 14 days of delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}