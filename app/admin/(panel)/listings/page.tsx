'use client'

import { useState } from 'react'
import CategoryManager from '@/components/admin/CategoryManager'
import ProductManager from '@/components/admin/ProductManager'

export default function ListingsPage() {
  const [tab, setTab] = useState<'categories' | 'products'>('products')

  return (
    <div className="space-y-8">
      <div>
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-2">Listings</p>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-espresso">
          Manage your <span className="italic text-bronze">collection</span>
        </h1>
      </div>

      <div className="flex border-b border-sand">
        {(['products', 'categories'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 pb-3 text-[10px] uppercase tracking-[0.25em] transition-colors border-b-2 ${
              tab === t
                ? 'text-espresso border-bronze'
                : 'text-taupe border-transparent hover:text-espresso'
            }`}
          >
            {t === 'products' ? 'Products' : 'Categories'}
          </button>
        ))}
      </div>

      {tab === 'products' ? <ProductManager /> : <CategoryManager />}
    </div>
  )
}