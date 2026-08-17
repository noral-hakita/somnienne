'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import type { StoreProduct } from '@/lib/api/products'

const CARD_TINTS = ['#F1EAE0', '#E9DFD2', '#EFE7DB', '#E4D8C6', '#F3EDE3']

export default function Showcase({ products, categoryName }: { products: StoreProduct[]; categoryName: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const count = products.length

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const exact = useTransform(scrollYProgress, [0, 1], [0, Math.max(count - 1, 0.0001)])

  useMotionValueEvent(exact, 'change', (v) => {
    setActive(Math.max(0, Math.min(Math.round(v), count - 1)))
  })

  // Within each segment: tilt sweeps -14° → +14° (backwards, then forwards)
  const tilt = useTransform(exact, (v) => {
    const frac = v - Math.floor(v)
    return (frac - 0.5) * 28
  })

  const product = products[active]
  if (!product) return null

  return (
    <div ref={ref} style={{ height: `${Math.max(count, 2) * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex items-center justify-center px-6 overflow-hidden">
        <div
          className="max-w-5xl w-full border border-sand shadow-xl shadow-espresso/5 transition-colors duration-700"
          style={{ backgroundColor: CARD_TINTS[active % CARD_TINTS.length] }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[420px] md:min-h-[520px]">
            {/* ─── Story side ─── */}
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-4">{categoryName}</p>
              <motion.h2
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-serif text-4xl md:text-5xl font-light text-espresso leading-tight mb-4"
              >
                {product.name}
              </motion.h2>
              <motion.p
                key={`${product.id}-desc`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-taupe text-sm md:text-base leading-relaxed mb-6"
              >
                {product.shortDescription}
              </motion.p>
              <p className="font-serif text-xl text-espresso/80 mb-8">Rs. {product.price.toLocaleString()}</p>
              <div>
                <Link
                  href={`/product/${product.id}`}
                  className="inline-block bg-espresso text-ivory px-8 py-3.5 text-[10px] uppercase tracking-[0.25em] hover:bg-bronze transition-colors"
                >
                  View piece
                </Link>
              </div>
            </div>

            {/* ─── Tilting image side ─── */}
            <div className="relative flex items-center justify-center p-10 md:p-14" style={{ perspective: 1000 }}>
              <motion.div
                style={{ rotateY: tilt }}
                className="relative w-full max-w-sm aspect-[3/4] bg-linen overflow-hidden shadow-2xl shadow-espresso/10"
              >
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 80vw, 384px" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${product.imageGradient}`} />
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* ─── Progress ─── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {products.map((p, i) => (
            <span key={p.id} className={`h-1 transition-all duration-500 ${i === active ? 'w-8 bg-bronze' : 'w-3 bg-sand'}`} />
          ))}
          <span className="ml-3 text-[10px] tracking-[0.3em] text-taupe">
            {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}