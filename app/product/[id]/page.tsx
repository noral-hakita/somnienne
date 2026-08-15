import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/api/products'
import AddToWardrobeButton from '@/components/AddToWardrobeButton'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        {/* Image Area */}
        <div className="aspect-[3/4] bg-linen overflow-hidden sticky top-24">
          <div className={`w-full h-full bg-gradient-to-br ${product.imageGradient} transition-transform duration-1000 hover:scale-105`} />
        </div>

        {/* Info Area */}
        <div className="flex flex-col">
          <p className="text-bronze text-[10px] md:text-xs uppercase tracking-[0.4em] mb-4">
            The Collection
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-espresso leading-tight">
            {product.name}
          </h1>
          <p className="font-serif text-2xl text-espresso/80 mt-4 mb-8">
            Rs. {product.price.toLocaleString()}
          </p>

          <p className="text-taupe text-base leading-relaxed mb-12">
            {product.fullDescription}
          </p>

          <AddToWardrobeButton product={product} />

          <div className="mt-12 border-t border-sand">
            <div className="py-6 border-b border-sand">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-espresso font-medium mb-2">
                Materials & Care
              </h3>
              <p className="text-taupe text-sm leading-relaxed">
                Premium fabric blend. Machine wash cold on gentle cycle. Tumble dry low or hang to dry.
              </p>
            </div>
            <div className="py-6 border-b border-sand">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-espresso font-medium mb-2">
                Shipping & Returns
              </h3>
              <p className="text-taupe text-sm leading-relaxed">
                Complimentary shipping on orders over Rs. 15,000. Easy returns within 14 days of delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}