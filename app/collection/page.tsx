import ProductCard from '@/components/ProductCard'

const mockProducts = [
  {
    id: "1",
    name: "The Silk Cloud",
    price: 14500,
    imageGradient: "from-ivory to-sand",
    shortDescription: "Weightless mulberry silk in our signature ivory."
  },
  {
    id: "2",
    name: "The Linen Dream",
    price: 12000,
    imageGradient: "from-sand to-linen",
    shortDescription: "Breathable French linen, washed for softness."
  },
  {
    id: "3",
    name: "The Midnight Cocoon",
    price: 18500,
    imageGradient: "from-espresso to-taupe",
    shortDescription: "Heavyweight cashmere blend for quiet winter nights."
  },
  {
    id: "4",
    name: "The Bronze Slip",
    price: 9500,
    imageGradient: "from-bronze to-sand",
    shortDescription: "A delicate bias-cut slip with bronze undertones."
  }
]

export default function CollectionPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
      <div className="flex flex-col items-center text-center mb-16">
        <p className="text-bronze text-[10px] md:text-xs uppercase tracking-[0.4em] mb-4">
          The Collection
        </p>
        <h1 className="font-serif text-5xl md:text-6xl font-light text-espresso">
          Nights of <span className="italic text-bronze">Sleep</span>
        </h1>
        <p className="text-taupe mt-4 max-w-md">
          Every piece is crafted to be lived in. Explore our current selection of quiet luxury sleepwear.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}