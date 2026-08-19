'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface SpotlightData {
  id: string
  name: string
  retail: number
  sale: number | null
  images: string[]
  ends_at: string | null
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function CraftPage() {
  const ref = useRef<HTMLDivElement>(null)
  const [sp, setSp] = useState<SpotlightData | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    createClient().rpc('get_spotlight').then(({ data }) => {
      setSp((data as SpotlightData) ?? null)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const images = sp?.images ?? []
  const segments = Math.max(images.length, 1)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const doorL = useTransform(scrollYProgress, [0, 0.12], ['0%', '-101%'])
  const doorR = useTransform(scrollYProgress, [0, 0.12], ['0%', '101%'])
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0])
  const riseY = useTransform(scrollYProgress, [0.08, 0.22], ['75%', '0%'])
  const infoOpacity = useTransform(scrollYProgress, [0.18, 0.28], [0, 1])
  const exactImg = useTransform(scrollYProgress, [0.3, 0.75], [0, Math.max(segments - 1, 0.0001)])
  const timerOpacity = useTransform(scrollYProgress, [0.82, 0.92], [0, 1])
  const timerY = useTransform(scrollYProgress, [0.82, 0.92], [24, 0])

  useMotionValueEvent(exactImg, 'change', (v) => {
    setImgIdx(Math.max(0, Math.min(Math.round(v), segments - 1)))
  })

  if (loaded && (!sp || images.length === 0)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-espresso">
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-4">Spotlight</p>
        <p className="font-serif italic text-ivory/60 text-lg">The atelier is choosing the next piece under the light.</p>
      </div>
    )
  }

  let countdown: string | null = null
  let ended = false
  if (sp?.ends_at) {
    const diff = new Date(sp.ends_at).getTime() - now
    if (diff <= 0) ended = true
    else {
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      countdown = `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`
    }
  }

  return (
    <div ref={ref} style={{ height: `${(3 + segments) * 100}vh` }} className="relative bg-espresso">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ─── The piece rising from below ─── */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <motion.div style={{ y: riseY }} className="relative w-[86vw] max-w-sm aspect-[3/4] bg-linen shadow-2xl shadow-black/50">
            {images.map((url, i) => (
              <div key={url} className={`absolute inset-0 transition-opacity duration-500 ${i === imgIdx ? 'opacity-100' : 'opacity-0'}`}>
                <Image src={url} alt={`${sp?.name ?? 'Spotlight'} view ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 90vw, 384px" />
              </div>
            ))}
          </motion.div>
        </div>

        {/* ─── Name + spotlight price ─── */}
        <motion.div style={{ opacity: infoOpacity }} className="absolute inset-x-0 bottom-20 md:bottom-24 flex flex-col items-center text-center px-6 pointer-events-none">
          <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-2">Spotlight · Limited time</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-ivory mb-3">{sp?.name}</h1>
          <div className="flex items-baseline gap-4">
            {sp?.sale ? (
              <>
                <span className="font-serif text-lg text-ivory/40 line-through">Rs. {Number(sp.retail).toLocaleString()}</span>
                <span className="font-serif text-2xl md:text-3xl text-bronze">Rs. {Number(sp.sale).toLocaleString()}</span>
              </>
            ) : (
              <span className="font-serif text-2xl md:text-3xl text-bronze">Rs. {Number(sp?.retail ?? 0).toLocaleString()}</span>
            )}
          </div>
          <p className="text-ivory/40 text-[10px] tracking-[0.3em] mt-4">{pad(imgIdx + 1)} / {pad(segments)}</p>
        </motion.div>

        {/* ─── Final frame: countdown + CTA ─── */}
        <motion.div
          style={{ opacity: timerOpacity, y: timerY }}
          className="absolute inset-0 flex flex-col items-center justify-end pb-20 text-center px-6 bg-gradient-to-t from-espresso via-espresso/70 to-transparent pointer-events-none"
        >
          {sp?.ends_at && (
            ended ? (
              <p className="font-serif italic text-ivory/60 text-lg mb-6">The spotlight has moved on.</p>
            ) : (
              <p className="font-serif text-2xl md:text-3xl text-ivory mb-6 tabular-nums">{countdown}</p>
            )
          )}
          <Link
            href={`/product/${sp?.id}`}
            className="pointer-events-auto bg-bronze text-espresso px-10 py-4 text-xs uppercase tracking-[0.25em] font-medium hover:bg-ivory transition-colors"
          >
            Claim the spotlight
          </Link>
        </motion.div>

        {/* ─── The doors ─── */}
        <motion.div style={{ x: doorL }} className="absolute inset-y-0 left-0 w-1/2 bg-[#241a10] border-r border-bronze/30 flex items-center justify-end">
          <span className="pr-6 font-serif text-ivory/20 text-2xl tracking-[0.3em] uppercase [writing-mode:vertical-rl]">Somnienne</span>
        </motion.div>
        <motion.div style={{ x: doorR }} className="absolute inset-y-0 right-0 w-1/2 bg-[#241a10] border-l border-bronze/30 flex items-center justify-start">
          <span className="pl-6 font-serif text-ivory/20 text-2xl tracking-[0.3em] uppercase [writing-mode:vertical-rl]">Spotlight</span>
        </motion.div>

        {/* ─── Hint while doors are closed ─── */}
        <motion.div style={{ opacity: hintOpacity }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-3">Spotlight</p>
          <p className="text-ivory/50 text-[10px] uppercase tracking-[0.3em]">Scroll to open</p>
        </motion.div>
      </div>
    </div>
  )
}