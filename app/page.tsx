import Link from 'next/link'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative">
        <p className="text-bronze text-[10px] md:text-xs uppercase tracking-[0.4em] mb-6">
          Quiet Luxury Sleepwear
        </p>
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
            Explore the Wardrobe
          </Link>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-espresso/30">
          <span className="block w-px h-16 bg-gradient-to-b from-bronze to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        </div>
      </section>

      {/* Dummy spacing to test the Navbar scroll effect */}
      <section className="h-screen bg-linen flex items-center justify-center">
        <h2 className="font-serif text-4xl text-espresso">The Collection (Coming Next)</h2>
      </section>
    </div>
  )
}