'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
}

const GRADIENTS = [
  'from-ivory to-sand',
  'from-sand to-linen',
  'from-espresso to-taupe',
  'from-bronze to-sand',
  'from-linen to-ivory',
  'from-taupe to-espresso',
]

export default function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Basic info
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [gradient, setGradient] = useState(GRADIENTS[0])

  // Variants
  const [hasSizes, setHasSizes] = useState(false)
  const [sizes, setSizes] = useState('')
  const [colors, setColors] = useState('')
  const [stock, setStock] = useState('10')

  const supabase = createClient()

  useEffect(() => {
    supabase.from('categories').select('id, name').eq('is_active', true).order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      // 1. Create the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name,
          slug,
          category_id: categoryId || null,
          short_description: shortDescription,
          full_description: fullDescription,
          retail_price: Number(retailPrice),
          sale_price: salePrice ? Number(salePrice) : null,
          has_sizes: hasSizes,
          is_active: false, // Always start as draft
        })
        .select()
        .single()

      if (productError) throw productError

      // 2. Generate variants
      const sizeList = hasSizes ? sizes.split(',').map(s => s.trim()).filter(Boolean) : ['One Size']
      const colorList = colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : ['Default']

      const variants = []
      for (const size of sizeList) {
        for (const color of colorList) {
          const sku = `SOM-${slug}-${size}-${color}`.toUpperCase().replace(/\s+/g, '-')
          variants.push({
            product_id: product.id,
            sku,
            attributes: { size, color },
            stock: Number(stock),
            is_custom: false,
            image_url: gradient,
          })
        }
      }

      // 3. Add custom size option if hasSizes is true
      if (hasSizes) {
        variants.push({
          product_id: product.id,
          sku: `SOM-${slug}-CUSTOM`.toUpperCase(),
          attributes: { size: 'Custom', color: colorList[0] },
          stock: 999, // Custom sizes are made to order
          is_custom: true,
          image_url: gradient,
        })
      }

      const { error: variantError } = await supabase.from('product_variants').insert(variants)
      if (variantError) throw variantError

      onSuccess()
    } catch (err: any) {
      setError(err.message)
      setCreating(false)
    }
  }

  const inputCls = 'w-full bg-transparent border border-sand px-4 py-3 text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors'
  const labelCls = 'block text-[10px] uppercase tracking-[0.25em] text-taupe mb-2'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.25em] text-espresso mb-4">Basic info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Product name</label>
            <input className={inputCls} placeholder="The Silk Cloud" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className={labelCls}>Short description</label>
          <input className={inputCls} placeholder="Weightless mulberry silk in our signature ivory." value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
        </div>
        <div className="mt-4">
          <label className={labelCls}>Full description</label>
          <textarea className={`${inputCls} resize-none`} rows={4} placeholder="Crafted from the finest mulberry silk..." value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} />
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.25em] text-espresso mb-4">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Retail price (PKR)</label>
            <input className={inputCls} type="number" placeholder="14500" value={retailPrice} onChange={(e) => setRetailPrice(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Sale price (optional)</label>
            <input className={inputCls} type="number" placeholder="12000" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Variants */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.25em] text-espresso mb-4">Variants</h3>
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSizes}
              onChange={(e) => setHasSizes(e.target.checked)}
              className="w-4 h-4 accent-bronze"
            />
            <span className="text-sm text-espresso">This product has sizes</span>
          </label>
        </div>

        {hasSizes && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Sizes (comma-separated)</label>
              <input className={inputCls} placeholder="XS, S, M, L, XL" value={sizes} onChange={(e) => setSizes(e.target.value)} required={hasSizes} />
            </div>
            <div>
              <label className={labelCls}>Colors (comma-separated)</label>
              <input className={inputCls} placeholder="Ivory, Sand, Espresso" value={colors} onChange={(e) => setColors(e.target.value)} />
            </div>
          </div>
        )}

        {!hasSizes && (
          <div className="mb-4">
            <label className={labelCls}>Colors (comma-separated, optional)</label>
            <input className={inputCls} placeholder="Ivory, Sand" value={colors} onChange={(e) => setColors(e.target.value)} />
          </div>
        )}

        <div>
          <label className={labelCls}>Stock per variant</label>
          <input className={inputCls} type="number" placeholder="10" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>

        {hasSizes && (
          <p className="text-taupe text-xs mt-3 italic">
            A "Custom size" option will be auto-added. Custom sizes are made to order (7-day lead time).
          </p>
        )}
      </div>

      {/* Placeholder gradient */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.25em] text-espresso mb-4">Placeholder gradient (for now)</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {GRADIENTS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGradient(g)}
              className={`aspect-square bg-gradient-to-br ${g} border-2 transition-all ${
                gradient === g ? 'border-bronze scale-105' : 'border-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={creating}
        className="w-full bg-espresso text-ivory py-4 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create product (as draft)'}
      </button>

      <p className="text-taupe text-xs text-center">
        Products are created as drafts. Activate them from the list above when ready.
      </p>
    </form>
  )
}