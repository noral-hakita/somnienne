'use client'

import { useEffect, useState } from 'react'
import { Loader2, ImagePlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Category { id: string; name: string }

const GRADIENTS = [
  'from-ivory to-sand',
  'from-sand to-linen',
  'from-espresso to-taupe',
  'from-bronze to-sand',
  'from-linen to-ivory',
  'from-taupe to-espresso',
]

export default function ProductForm({
  onSuccess,
  existingId,
}: {
  onSuccess: () => void
  existingId?: string | null
}) {
  const isEdit = Boolean(existingId)
  const [categories, setCategories] = useState<Category[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [care, setCare] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [gradient, setGradient] = useState(GRADIENTS[0])

  const [hasSizes, setHasSizes] = useState(false)
  const [sizes, setSizes] = useState('')
  const [colors, setColors] = useState('')
  const [stock, setStock] = useState('10')

  const [editColors, setEditColors] = useState<string[]>([])
  const [filesByColor, setFilesByColor] = useState<Record<string, File[]>>({})
  const [generalFiles, setGeneralFiles] = useState<File[]>([])

  const supabase = createClient()

  useEffect(() => {
    supabase.from('categories').select('id, name').eq('is_active', true).order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  // Load existing product for edit mode
  useEffect(() => {
    if (!existingId) return
    supabase
      .from('products')
      .select('*, product_variants(attributes)')
      .eq('id', existingId)
      .single()
      .then(({ data: p }) => {
        if (!p) return
        setName(p.name)
        setCategoryId(p.category_id ?? '')
        setShortDescription(p.short_description ?? '')
        setFullDescription(p.full_description ?? '')
        setCare(p.care_instructions ?? '')
        setRetailPrice(String(p.retail_price))
        setSalePrice(p.sale_price ? String(p.sale_price) : '')
        setHasSizes(p.has_sizes)
        setEditColors([...new Set((p.product_variants ?? []).map((v: any) => v.attributes?.color).filter(Boolean))] as string[])
      })
  }, [existingId])

  const colorList = isEdit
    ? editColors
    : colors.split(',').map((c) => c.trim()).filter(Boolean)

  const uploadFiles = async (productId: string, files: File[], color: string | null): Promise<string[]> => {
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const path = `products/${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${f.name.replace(/[^a-zA-Z0-9.]+/g, '-')}`
      const { error: upErr } = await supabase.storage.from('product-media').upload(path, f, { contentType: f.type })
      if (upErr) throw upErr
      urls.push(supabase.storage.from('product-media').getPublicUrl(path).data.publicUrl)
    }
    if (urls.length > 0) {
      const { error: insErr } = await supabase.from('product_media').insert(
        urls.map((url, i) => ({ product_id: productId, url, color, type: 'image', position: 100 + i }))
      )
      if (insErr) throw insErr
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      let productId = existingId ?? ''

      if (isEdit) {
        // ─── EDIT: update info, never touch variants ───
        const { error: upErr } = await supabase
          .from('products')
          .update({
            name,
            category_id: categoryId || null,
            short_description: shortDescription,
            full_description: fullDescription,
            care_instructions: care || null,
            retail_price: Number(retailPrice),
            sale_price: salePrice ? Number(salePrice) : null,
          })
          .eq('id', existingId)
        if (upErr) throw upErr
      } else {
        // ─── CREATE: product first ───
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert({
            name,
            slug,
            category_id: categoryId || null,
            short_description: shortDescription,
            full_description: fullDescription,
            care_instructions: care || null,
            retail_price: Number(retailPrice),
            sale_price: salePrice ? Number(salePrice) : null,
            has_sizes: hasSizes,
            is_active: false,
          })
          .select()
          .single()
        if (productError) throw productError
        productId = product.id
      }

      // ─── Upload photos (per color + general) ───
      const firstUrlByColor: Record<string, string> = {}
      for (const c of colorList) {
        const urls = await uploadFiles(productId, filesByColor[c] ?? [], c)
        if (urls[0]) firstUrlByColor[c] = urls[0]
      }
      const generalUrls = await uploadFiles(productId, generalFiles, null)

      if (!isEdit) {
        // ─── CREATE only: generate variants ───
        const primary = generalUrls[0] ?? Object.values(firstUrlByColor)[0] ?? gradient
        const sizeList = hasSizes ? sizes.split(',').map((s) => s.trim()).filter(Boolean) : ['One Size']
        const cList = colorList.length > 0 ? colorList : ['Default']

        const variants = []
        for (const size of sizeList) {
          for (const color of cList) {
            const sku = `SOM-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${size}-${color}`.toUpperCase().replace(/\s+/g, '-')
            variants.push({
              product_id: productId,
              sku,
              attributes: { size, color },
              stock: Number(stock),
              is_custom: false,
              image_url: firstUrlByColor[color] ?? primary,
            })
          }
        }
        if (hasSizes) {
          variants.push({
            product_id: productId,
            sku: `SOM-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-CUSTOM`.toUpperCase(),
            attributes: { size: 'Custom', color: cList[0] },
            stock: 999,
            is_custom: true,
            image_url: primary,
          })
        }
        const { error: variantError } = await supabase.from('product_variants').insert(variants)
        if (variantError) throw variantError
      }

      setFilesByColor({})
      setGeneralFiles([])
      onSuccess()
    } catch (err: any) {
      setError(err.message)
      setCreating(false)
    }
  }

  const inputCls = 'w-full bg-transparent border border-sand px-4 py-3 text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors'
  const labelCls = 'block text-[10px] uppercase tracking-[0.25em] text-taupe mb-2'

  const uploadBox = (key: string | null, label: string) => (
    <div key={key ?? 'general'}>
      <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-sand hover:border-bronze transition-colors p-5 cursor-pointer bg-ivory">
        <ImagePlus className="w-5 h-5 text-bronze" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-taupe text-center">
          {((key ? filesByColor[key] : generalFiles) ?? []).length > 0
            ? `${(key ? filesByColor[key] : generalFiles).length} photo(s) — ${label}`
            : `Photos — ${label}`}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (key) setFilesByColor({ ...filesByColor, [key]: files })
            else setGeneralFiles(files)
          }}
        />
      </label>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
          <textarea className={`${inputCls} resize-none`} rows={4} placeholder="The story of this piece…" value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} />
        </div>
        <div className="mt-4">
          <label className={labelCls}>Materials & Care (shown on product page)</label>
          <textarea className={`${inputCls} resize-none`} rows={3} placeholder="65% Viscose / 30% Cotton / 5% Spandex. Machine wash cold, gentle cycle…" value={care} onChange={(e) => setCare(e.target.value)} />
        </div>
      </div>

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

      {/* Photography */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.25em] text-espresso mb-4">Photography</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colorList.map((c) => uploadBox(c, c))}
          {uploadBox(null, 'all colors')}
        </div>
        <p className="text-taupe text-xs mt-2 italic">
          Photos tagged with a color appear only when that color is selected. Untagged photos always show.
        </p>
        {!isEdit && (
          <div className="mt-4">
            <label className={labelCls}>Fallback gradient</label>
            <div className="grid grid-cols-6 gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGradient(g)}
                  className={`aspect-square bg-gradient-to-br ${g} border-2 transition-all ${gradient === g ? 'border-bronze scale-105' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {!isEdit && (
        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-espresso mb-4">Variants</h3>
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={hasSizes} onChange={(e) => setHasSizes(e.target.checked)} className="w-4 h-4 accent-bronze" />
              <span className="text-sm text-espresso">This product has sizes</span>
            </label>
          </div>
          {hasSizes && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Sizes (comma-separated)</label>
                <input className={inputCls} placeholder="XS, S, M, L, XL" value={sizes} onChange={(e) => setSizes(e.target.value)} required />
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
            <p className="text-taupe text-xs mt-3 italic">A "Custom size" option will be auto-added (made to order).</p>
          )}
        </div>
      )}

      {isEdit && (
        <p className="text-taupe text-xs italic">
          Editing changes info, pricing, care copy and adds photos. Sizes, colors and stock live in Inventory.
        </p>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={creating}
        className="w-full bg-espresso text-ivory py-4 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save changes' : 'Create product (as draft)'}
      </button>
    </form>
  )
}