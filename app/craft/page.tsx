'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface CraftProduct {
  id: string
  name: string
  price: number
  image: string | null
}

export default function CraftPage() {
  const ref = useRef<HTMLDivElement>(null)
  const [product, setProduct] = useState<CraftProduct | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    createClient()
      .rpc('get_craft_product')
      .then(({ data }) => {
        setProduct((data as CraftProduct) ?? null)
        setLoaded(true)
      })
  }, [])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // The bronze thread draws down, fades, and the piece unveils through the seam
  const thread = useTransform(scrollYProgress, [0.02, 0.2], ['0%', '100%'])
  const threadOpacity = useTransform(scrollYProgress, [0.2, 0.3], [1, 0])
  const reveal = useTransform(scrollYProgress, [0.25, 0.65], ['inset(50% 50% 50% 50%)', 'inset(0% 0% 0% 0%)'])
  const scale = useTransform(scrollYProgress, [0.25, 0.7], [1.12, 1])

  const capCut = useTransform(scrollYProgress, [0.04, 0.1, 0.16, 0.22], [0, 1, 1, 0])
  const capStitch = useTransform(scrollYProgress, [0.3, 0.36, 0.44, 0.5], [0, 1, 1, 0])
  const capFinish = useTransform(scrollYProgress, [0.55, 0.61, 0.69, 0.75], [0, 1, 1, 0])

  const finalOpacity = useTransform(scrollYProgress, [0.8, 0.92], [0, 1])
  const finalY = useTransform(scrollYProgress, [0.8, 0.92], [24, 0])

  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        delay: `${Math.random() * 4}s`,
      })),
    []
  )

  if (loaded && !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-espresso">
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-4">The Craft</p>
        <p className="font-serif italic text-ivory/60 text-lg">The atelier is choosing its next piece. Check back soon.</p>
      </div>
    )
  }

  return (
    <div ref={ref} style={{ height: '340vh' }} className="relative bg-espresso">
      <div className="sticky top-0 h-screen overflow-hidden">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-ivory"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: 0.15, animation: `twinkle 4s ease-in-out ${s.delay} infinite` }}
          />
        ))}

        {/* the thread */}
        <motion.span className="absolute left-1/2 top-0 w-px bg-bronze" style={{ height: thread, opacity: threadOpacity }} />

        {/* the unveiling piece */}
        {product?.image && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <motion.div
              style={{ clipPath: reveal, scale }}
              className="relative w-full max-w-sm aspect-[3/4] bg-linen shadow-2xl shadow-black/40"
            >
              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 90vw, 384px" />
            </motion.div>
          </div>
        )}

        {/* captions */}
        <div className="absolute bottom-8 inset-x-0 flex justify-center px-6">
          <div className="relative h-14 max-w-md text-center">
            <motion.p style={{ opacity: capCut }} className="absolute inset-x-0 font-serif italic text-ivory/70 text-lg">
              The cut — cloth measured under quiet light.
            </motion.p>
            <motion.p style={{ opacity: capStitch }} className="absolute inset-x-0 font-serif italic text-ivory/70 text-lg">
              The stitch — one bronze thread, seam by seam.
            </motion.p>
            <motion.p style={{ opacity: capFinish }} className="absolute inset-x-0 font-serif italic text-ivory/70 text-lg">
              The finish — pressed, checked, and folded by hand.
            </motion.p>
          </div>
        </div>

        {/* final frame */}
        {product && (
          <motion.div
            style={{ opacity: finalOpacity, y: finalY }}
            className="absolute inset-0 flex flex-col items-center justify-end pb-24 text-center px-6 bg-gradient-to-t from-espresso via-espresso/60 to-transparent"
          >
            <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-3">The Craft</p>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-ivory mb-2">{product.name}</h1>
            <p className="font-serif text-xl text-ivory/70 mb-8">Rs. {Number(product.price).toLocaleString()}</p>
            <Link
              href={`/product/${product.id}`}
              className="bg-bronze text-espresso px-10 py-4 text-xs uppercase tracking-[0.25em] font-medium hover:bg-ivory transition-colors"
            >
              View piece
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}