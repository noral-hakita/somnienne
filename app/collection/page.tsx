import ProductCard from '@/components/ProductCard'
import { getProducts } from '@/lib/api/products'

export default async function CollectionPage() {
  const products = await getProducts()

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
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}