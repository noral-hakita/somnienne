'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Eye, EyeOff, Trash2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ProductForm from './ProductForm'

interface Product {
  id: string
  name: string
  slug: string
  retail_price: number
  is_active: boolean
  is_featured: boolean
  categories: { name: string } | null
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const supabase = createClient()

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
    setProducts((data ?? []) as Product[])
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    loadProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.25em] text-espresso">All products</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-espresso text-ivory px-6 py-3 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'New product'}
        </button>
      </div>

      {showForm && (
        <div className="bg-ivory border border-sand p-8">
          <ProductForm onSuccess={() => { setShowForm(false); loadProducts() }} />
        </div>
      )}

      <div className="bg-ivory border border-sand p-6">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-bronze" />
        ) : products.length === 0 ? (
          <p className="text-taupe text-sm italic">No products yet. Create your first one above.</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between border border-sand px-4 py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-espresso text-sm font-medium">{p.name}</p>
                    {p.is_featured && (
                      <span className="text-[9px] uppercase tracking-[0.2em] bg-bronze text-ivory px-2 py-0.5">Featured</span>
                    )}
                    {!p.is_active && (
                      <span className="text-[9px] uppercase tracking-[0.2em] bg-taupe/20 text-taupe px-2 py-0.5">Draft</span>
                    )}
                  </div>
                  <p className="text-taupe text-xs mt-1">
                    Rs. {Number(p.retail_price).toLocaleString()} · {p.categories?.name ?? 'No category'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await supabase.from('products').update({ is_featured: !p.is_featured }).eq('id', p.id)
                        loadProducts()
                      }}
                      className={`p-2 transition-colors ${p.is_featured ? 'text-bronze' : 'text-taupe/40 hover:text-bronze'}`}
                      title={p.is_featured ? 'Remove from home' : 'Feature on home'}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  <button
                    onClick={() => toggleActive(p.id, p.is_active)}
                    className={`p-2 transition-colors ${p.is_active ? 'text-bronze hover:text-espresso' : 'text-taupe hover:text-bronze'}`}
                    title={p.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-taupe hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}