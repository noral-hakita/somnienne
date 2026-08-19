'use client'

import Link from 'next/link'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { useState, useEffect } from 'react'
import WardrobeIcon from './WardrobeIcon'
import AccountButton from './AccountButton'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const dark = pathname.startsWith('/craft')
  const [scrolled, setScrolled] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const count = useWardrobeStore((state) => state.getItemCount())

  useEffect(() => {
    setIsClient(true)
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (pathname.startsWith('/admin')) return null

  const linkCls = `text-xs uppercase tracking-[0.25em] transition-colors duration-300 ${
    dark ? 'text-ivory/70 hover:text-bronze' : 'text-espresso/70 hover:text-bronze'
  }`

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 transition-all duration-500 ${
      scrolled
        ? dark ? 'bg-espresso/90 backdrop-blur-md shadow-sm' : 'bg-ivory/90 backdrop-blur-md shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className={`font-serif text-2xl tracking-[0.2em] uppercase ${dark ? 'text-ivory' : 'text-espresso'}`}>
          Somnienne
        </Link>
        <ul className="hidden md:flex items-center gap-10 list-none">
          <li><Link href="/collection" className={linkCls}>Collection</Link></li>
          <li><Link href="/craft" className={linkCls}>Spotlight</Link></li>
          <li><Link href="/story" className={linkCls}>Our Story</Link></li>
        </ul>
        <div className="flex items-center gap-6">
          <AccountButton />
          <Link href="/wardrobe" className="relative group">
            <WardrobeIcon className={`w-6 h-6 transition-colors group-hover:text-bronze ${dark ? 'text-ivory' : 'text-espresso'}`} />
            {isClient && count > 0 && (
              <span className="absolute -top-2 -right-3 bg-bronze text-ivory text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}