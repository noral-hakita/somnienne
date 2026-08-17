'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useWardrobeStore } from '@/store/wardrobeStore'
import type { StoreProduct } from '@/lib/api/products'

export default function ProductCard({ product }: { product: StoreProduct }) {
  const addItem = useWardrobeStore((state) => state.addItem)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      card.style.transform = `perspective(800px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) scale(1.02)`
    }
    const handleMouseLeave = () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)'
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const variants = product.variants ?? []
  const single = variants.length === 1 ? variants[0] : null
  const soldOut = variants.length === 0 || variants.every((v) => v.stock <= 0)
  const photo = product.images[0]

  const quickAdd = () => {
    if (!single || single.stock <= 0) return
    addItem({
      id: product.id,
      variantId: single.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? product.imageGradient,
      attributes: single.isCustom ? 'Custom size' : `${single.size} · ${single.color}`,
    })
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-linen border border-sand hover:border-bronze/40 transition-all duration-500 flex flex-col overflow-hidden"
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out, border-color 0.5s ease' }}
    >
      <Link href={`/product/${product.id}`} className="block aspect-[3/4] overflow-hidden relative">
        {photo ? (
          <Image
            src={photo}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${product.imageGradient} transition-transform duration-1000 group-hover:scale-105`} />
        )}
        {!photo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-serif text-2xl italic text-espresso/20 tracking-widest uppercase">
              {product.name.split(' ')[1]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>

      <div className="p-6 flex-1 flex flex-col bg-ivory">
        {product.categoryName && (
          <p className="text-bronze text-[9px] uppercase tracking-[0.3em] mb-2">{product.categoryName}</p>
        )}
        <Link href={`/product/${product.id}`} className="mb-4 block">
          <h3 className="font-serif text-xl font-light text-espresso group-hover:text-bronze transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-start justify-between mb-6">
          <p className="text-taupe text-sm flex-1 pr-2">{product.shortDescription}</p>
          <span className="text-espresso font-light text-sm whitespace-nowrap">Rs. {product.price.toLocaleString()}</span>
        </div>

        <div className="mt-auto">
          {single ? (
            <button
              onClick={quickAdd}
              disabled={single.stock <= 0}
              className="w-full bg-espresso hover:bg-bronze text-ivory border border-espresso hover:border-bronze px-4 py-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50"
            >
              {single.stock <= 0 ? 'Sold out' : 'Add to Wardrobe'}
            </button>
          ) : (
            <Link
              href={`/product/${product.id}`}
              className="block w-full bg-espresso hover:bg-bronze text-ivory border border-espresso hover:border-bronze px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-center transition-all duration-300"
            >
              {soldOut ? 'Sold out' : 'Select Options'}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}