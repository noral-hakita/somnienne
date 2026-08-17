'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({
  images,
  gradient,
  name,
}: {
  images: string[]
  gradient: string
  name: string
}) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-linen overflow-hidden sticky top-24">
        <div className={`w-full h-full bg-gradient-to-br ${gradient} transition-transform duration-1000 hover:scale-105`} />
      </div>
    )
  }

  const src = images[active] ?? images[0]

  return (
    <div className="sticky top-24 space-y-3">
      <div className="aspect-[3/4] bg-linen overflow-hidden relative">
        <Image src={src} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`relative w-16 h-20 flex-shrink-0 overflow-hidden border-2 transition-colors ${
                i === active ? 'border-bronze' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`${name} view ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}