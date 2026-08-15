'use client'

import { useWardrobeStore } from '@/store/wardrobeStore'
import type { StoreProduct } from '@/lib/api/products'

export default function AddToWardrobeButton({ product }: { product: StoreProduct }) {
  const addItem = useWardrobeStore((state) => state.addItem)

  return (
    <button
      onClick={() => {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.imageGradient,
        })
      }}
      className="w-full bg-espresso hover:bg-bronze text-ivory border border-espresso hover:border-bronze px-4 py-4 text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300"
    >
      Add to Wardrobe
    </button>
  )
}