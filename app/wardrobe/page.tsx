'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWardrobeStore, wardrobeLineKey } from '@/store/wardrobeStore'
import { Minus, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function WardrobePage() {
  const { items, removeItem, updateQuantity, getSubtotal, clearWardrobe } = useWardrobeStore()
  const subtotal = getSubtotal()
  const [stockMap, setStockMap] = useState<Record<string, number>>({})

  useEffect(() => {
    const ids = items.map((i) => i.variantId ?? i.id).filter(Boolean)
    if (ids.length === 0) return
    createClient()
      .from('product_variants').select('id, stock').in('id', ids)
      .then(({ data }) => {
        const m: Record<string, number> = {}
        ;(data ?? []).forEach((v: { id: string; stock: number }) => { m[v.id] = v.stock })
        setStockMap(m)
      })
  }, [items])

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-40 pb-24 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="font-serif text-4xl md:text-5xl text-espresso mb-4">Your Wardrobe is Empty</h2>
        <p className="text-taupe mb-8 max-w-md mx-auto">
          You haven't assembled your nights of sleep yet. Explore our collection to find your perfect fit.
        </p>
        <Link
          href="/collection"
          className="inline-block bg-espresso text-ivory px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-bronze transition-colors duration-300"
        >
          Explore Collection
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pt-32 pb-24">
      <div className="flex items-end justify-between border-b border-sand pb-6 mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-espresso">Your Wardrobe</h1>
        <button
          onClick={clearWardrobe}
          className="text-taupe hover:text-bronze text-[10px] uppercase tracking-[0.2em] transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 divide-y divide-sand">
          {items.map((item) => {
            const key = wardrobeLineKey(item)
            return (
              <div key={key} className="py-8 flex gap-6">
                <Link href={`/product/${item.id}`} className="relative w-24 h-32 md:w-32 md:h-40 bg-linen flex-shrink-0 overflow-hidden">
                  {item.image?.startsWith('http') ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="128px" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${item.image || 'from-ivory to-sand'}`} />
                  )}
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/product/${item.id}`} className="font-serif text-xl md:text-2xl text-espresso hover:text-bronze transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-taupe text-sm mt-1">{item.attributes ?? 'One Size'}</p>
                      {stockMap[key] !== undefined && item.quantity >= stockMap[key] && (
                        <p className="text-bronze text-xs mt-1">Only {stockMap[key]} available.</p>
                      )}
                      {item.customNotes && (
                        <p className="text-bronze text-xs mt-1 italic">“{item.customNotes}”</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(key)}
                      className="text-taupe hover:text-bronze transition-colors"
                      aria-label="Remove item"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center border border-sand">
                      <button
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-linen transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        disabled={stockMap[key] !== undefined && item.quantity >= stockMap[key]}
                        className="w-8 h-8 flex items-center justify-center hover:bg-linen transition-colors disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-serif text-lg text-espresso">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-linen p-8 border border-sand sticky top-32">
            <h2 className="font-serif text-2xl text-espresso mb-6">Order Summary</h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-taupe">
                <span>Subtotal</span>
                <span className="text-espresso">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-taupe">
                <span>Shipping</span>
                <span className="italic text-taupe/70">Calculated at checkout</span>
              </div>
              <div className="border-t border-sand pt-4 flex justify-between text-lg">
                <span className="font-serif text-espresso">Total</span>
                <span className="font-serif text-espresso">Rs. {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-espresso text-ivory text-center px-6 py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-bronze transition-colors duration-300 mt-8"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/collection"
              className="block w-full text-center text-taupe hover:text-bronze text-[10px] uppercase tracking-[0.2em] mt-4 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}