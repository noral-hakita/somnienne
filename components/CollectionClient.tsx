'use client'

import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
import type { StoreCategory, StoreProduct } from '@/lib/api/products'

function chip(isActive: boolean) {
  return `px-5 py-2 text-[10px] uppercase tracking-[0.25em] border transition-colors ${
    isActive
      ? 'bg-espresso text-ivory border-espresso'
      : 'border-sand text-taupe hover:border-bronze hover:text-espresso'
  }`
}

export default function CollectionClient({
  products,
  categories,
}: {
  products: StoreProduct[]
  categories: StoreCategory[]
}) {
  const [active, setActive] = useState<string | null>(null)
  const filtered = active ? products.filter((p) => p.categoryName === active) : products

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        <button onClick={() => setActive(null)} className={chip(active === null)}>
          All
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActive(c.name)} className={chip(active === c.name)}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center font-serif italic text-taupe">
          Nothing here yet — the atelier is still stitching.
        </p>
      )}
    </>
  )
}