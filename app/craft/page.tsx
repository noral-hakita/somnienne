'use client'

import { useMemo, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

const THREAD =
  'M140 60 L160 80 L180 60 M140 60 L90 80 L65 140 L100 150 L100 300 L220 300 L220 150 L255 140 L230 80 L180 60 M160 80 L160 300 M110 320 L210 320 M110 320 L118 400 M152 320 L148 400 M168 320 L172 400 M210 320 L202 400'

const STARS: [number, number][] = [
  [140, 60], [160, 80], [180, 60], [90, 80], [230, 80], [65, 140], [255, 140],
  [100, 150], [220, 150], [100, 300], [220, 300], [160, 300],
  [110, 320], [210, 320], [118, 400], [148, 400], [172, 400], [202, 400],
  [160, 120], [160, 160], [160, 200], [160, 240],
]

export default function CraftPage() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const thread = useTransform(scrollYProgress, [0.05, 0.8], [0, 1])
  const stitches = useTransform(scrollYProgress, [0.6, 0.85], [0, 1])

  const s1 = useTransform(scrollYProgress, [0.02, 0.08, 0.2, 0.26], [0, 1, 1, 0])
  const s2 = useTransform(scrollYProgress, [0.26, 0.32, 0.44, 0.5], [0, 1, 1, 0])
  const s3 = useTransform(scrollYProgress, [0.5, 0.56, 0.68, 0.74], [0, 1, 1, 0])
  const s4 = useTransform(scrollYProgress, [0.78, 0.86, 0.96, 1], [0, 1, 1, 0])

  const bgStars = useMemo(
    () =>
      Array.from({ length: 70 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        delay: `${Math.random() * 4}s`,
      })),
    []
  )

  return (
    <div className="bg-espresso text-ivory">
      {/* Intro */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <p className="text-bronze text-[10px] md:text-xs uppercase tracking-[0.4em] mb-6">The Atelier</p>
        <h1 className="font-serif text-5xl md:text-7xl font-light leading-[0.95] max-w-3xl">
          Stitched from <span className="italic text-bronze">starlight.</span>
        </h1>
        <p className="font-serif italic text-ivory/50 text-lg mt-6 max-w-xl">
          Scroll, and watch a night's sleep assembled — thread by thread, star by star.
        </p>
      </section>

      {/* The stitching cosmos */}
      <div ref={ref} style={{ height: '420vh' }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          {bgStars.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-ivory"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                opacity: 0.2,
                animation: `twinkle 4s ease-in-out ${s.delay} infinite`,
              }}
            />
          ))}

          <div className="relative w-[86vw] max-w-md">
            <svg viewBox="0 0 320 420" className="w-full h-auto">
              {STARS.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={2.2} fill="#FAF7F1" opacity={0.85} />
              ))}
              <motion.path
                d={THREAD}
                fill="none"
                stroke="#A87C4F"
                strokeWidth={1.6}
                strokeLinecap="round"
                style={{ pathLength: thread }}
              />
              <motion.path
                d={THREAD}
                fill="none"
                stroke="#FAF7F1"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeDasharray="1 7"
                style={{ opacity: stitches }}
              />
            </svg>
          </div>

          <div className="absolute bottom-10 inset-x-0 flex justify-center px-6">
            <div className="relative h-16 max-w-md text-center">
              <motion.p style={{ opacity: s1 }} className="absolute inset-x-0 font-serif italic text-ivory/70 text-lg">
                The cut — cloth measured under quiet light.
              </motion.p>
              <motion.p style={{ opacity: s2 }} className="absolute inset-x-0 font-serif italic text-ivory/70 text-lg">
                The stitch — one bronze thread, star to star.
              </motion.p>
              <motion.p style={{ opacity: s3 }} className="absolute inset-x-0 font-serif italic text-ivory/70 text-lg">
                The finish — seams pressed, buttons set by hand.
              </motion.p>
              <motion.p style={{ opacity: s4 }} className="absolute inset-x-0 font-serif italic text-bronze text-lg">
                The night — yours.
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="py-28 text-center px-6">
        <p className="text-ivory/50 text-sm max-w-md mx-auto mb-10">
          Every Somnienne piece passes through forty‑one hands before it reaches yours. Wear the constellation.
        </p>
        <Link
          href="/collection"
          className="inline-block bg-bronze text-espresso px-10 py-4 text-xs uppercase tracking-[0.25em] font-medium hover:bg-ivory transition-colors"
        >
          Explore the Collection
        </Link>
      </section>
    </div>
  )
}