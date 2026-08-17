'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="bg-espresso text-ivory mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl tracking-[0.2em] uppercase">Somnienne</p>
          <p className="font-serif italic text-ivory/50 mt-3 max-w-sm">
            Quiet luxury sleepwear, stitched for the half of your life that happens in the dark.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-bronze mb-5">Boutique</h4>
          <ul className="space-y-3 text-sm text-ivory/60">
            <li><Link href="/collection" className="hover:text-bronze transition-colors">The Collection</Link></li>
            <li><Link href="/story" className="hover:text-bronze transition-colors">Our Story</Link></li>
            <li><Link href="/wardrobe" className="hover:text-bronze transition-colors">Your Wardrobe</Link></li>
            <li><Link href="/account" className="hover:text-bronze transition-colors">Your Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-bronze mb-5">The Atelier</h4>
          <ul className="space-y-3 text-sm text-ivory/60">
            <li>WhatsApp: +92 300 0000000</li>
            <li>atelier@somnienne.com</li>
            <li>Cash on Delivery · Nationwide</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-6 text-center text-ivory/30 text-xs">
        © {new Date().getFullYear()} Somnienne. All rights reserved.
      </div>
    </footer>
  )
}