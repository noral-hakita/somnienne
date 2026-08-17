import Link from 'next/link'

export default function StoryPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-40 pb-24">
      <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-6">Our Story</p>
      <h1 className="font-serif text-5xl md:text-6xl font-light text-espresso leading-tight mb-12">
        The quiet half <span className="italic text-bronze">of life</span>
      </h1>

      <div className="space-y-6 text-taupe text-base leading-relaxed">
        <p>
          Somnienne began with a simple observation: we plan our meals, our clothes, our calendars —
          but we treat the hours we sleep as an afterthought. Yet sleep is a third of a life.
          We decided the quiet half of life deserved the same care as the loud half.
        </p>
        <p>
          So we make sleepwear the slow way. Breathable natural fabrics. Honest stitching.
          Silhouettes that ask nothing of you. No shouting logos, no seasonal noise —
          only pieces that feel like the exhale at the end of a long day.
        </p>
        <p>
          Every piece is checked by hand before it ships. Custom sizes are stitched to order
          in our atelier, because a night's comfort should never be one-size-fits-all.
          And when you confirm your order, you're not clicking a button —
          you're telling a tailor to begin.
        </p>
        <p>
          We are a small house with a single belief: dress the night well,
          and the day takes care of itself.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 border-t border-sand pt-10">
        <div>
          <p className="font-serif text-3xl text-espresso">100%</p>
          <p className="text-taupe text-[10px] uppercase tracking-[0.25em] mt-1">Hand-checked before shipping</p>
        </div>
        <div>
          <p className="font-serif text-3xl text-espresso">7<span className="italic text-bronze">day</span></p>
          <p className="text-taupe text-[10px] uppercase tracking-[0.25em] mt-1">Custom tailoring lead time</p>
        </div>
        <div>
          <p className="font-serif text-3xl text-espresso">14<span className="italic text-bronze">day</span></p>
          <p className="text-taupe text-[10px] uppercase tracking-[0.25em] mt-1">Easy returns, no questions</p>
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/collection"
          className="inline-block bg-espresso text-ivory px-10 py-4 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors"
        >
          Explore the Collection
        </Link>
      </div>
    </div>
  )
}