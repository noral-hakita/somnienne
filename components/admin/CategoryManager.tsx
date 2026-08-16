'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  is_active: boolean
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const loadCategories = async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false })
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { error } = await supabase.from('categories').insert({ name, slug, is_active: true })

    if (error) {
      setError(error.message)
      setCreating(false)
      return
    }

    setName('')
    setCreating(false)
    loadCategories()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products in it will become uncategorized.')) return
    await supabase.from('categories').delete().eq('id', id)
    loadCategories()
  }

  const inputCls = 'w-full bg-transparent border border-sand px-4 py-3 text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create form */}
      <div className="lg:col-span-1">
        <div className="bg-ivory border border-sand p-6">
          <h2 className="text-xs uppercase tracking-[0.25em] text-espresso mb-6">New category</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-taupe mb-2">Name</label>
              <input
                className={inputCls}
                placeholder="Night Suits"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-espresso text-ivory py-3 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Create</>}
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="bg-ivory border border-sand p-6">
          <h2 className="text-xs uppercase tracking-[0.25em] text-espresso mb-6">All categories</h2>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-bronze" />
          ) : categories.length === 0 ? (
            <p className="text-taupe text-sm italic">No categories yet. Create your first one.</p>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between border border-sand px-4 py-3">
                  <div>
                    <p className="text-espresso text-sm">{cat.name}</p>
                    <p className="text-taupe text-xs">/{cat.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-taupe hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}