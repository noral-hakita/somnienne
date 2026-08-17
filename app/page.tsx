import Link from 'next/link'
import { getFeaturedProducts } from '@/lib/api/products'
import ProductCard from '@/components/ProductCard'

export default async function Home() {
  const featured = await getFeaturedProducts()

  return (
    <div>
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative">
        <p className="text-bronze text-[10px] md:text-xs uppercase tracking-[0.4em] mb-6">Quiet Luxury Sleepwear</p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] text-espresso max-w-4xl">
          Assemble your <br />
          <span className="italic text-bronze">nights of sleep.</span>
        </h1>
        <p className="font-serif text-lg md:text-xl italic text-espresso/60 mt-8 max-w-xl mx-auto">
          Premium pajamas crafted for the quiet luxury lifestyle.
        </p>
        <div className="mt-12">
          <Link
            href="/collection"
            className="inline-block bg-espresso text-ivory px-10 py-4 text-xs uppercase tracking-[0.25em] font-medium hover:bg-bronze transition-colors duration-500"
          >
            Explore the Collection
          </Link>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-espresso/30">
          <span className="block w-px h-16 bg-gradient-to-b from-bronze to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        </div>
      </section>

      {/* Featured pieces */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-3">The Atelier's Choice</p>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-espresso">
                Featured <span className="italic text-bronze">pieces</span>
              </h2>
            </div>
            <Link href="/collection" className="hidden md:inline-block text-xs uppercase tracking-[0.25em] text-taupe hover:text-bronze transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Philosophy teaser */}
      <section className="bg-linen py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-6">Our Philosophy</p>
          <p className="font-serif text-2xl md:text-4xl font-light text-espresso leading-snug">
            "Sleep is not an escape from life. <span className="italic text-bronze">It is the quiet half of it.</span>"
          </p>
          <p className="text-taupe text-sm md:text-base leading-relaxed mt-8 max-w-xl mx-auto">
            Every Somnienne piece is cut for stillness — breathable fabrics, honest stitching, and silhouettes that ask nothing of you. We make fewer things, slowly, so your nights can be lighter.
          </p>
          <Link
            href="/story"
            className="inline-block mt-10 border border-espresso px-10 py-4 text-xs uppercase tracking-[0.25em] text-espresso hover:bg-espresso hover:text-ivory transition-colors duration-500"
          >
            Read our story
          </Link>
        </div>
      </section>
    </div>
  )
}