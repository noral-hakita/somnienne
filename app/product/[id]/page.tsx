import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/api/products'
import ProductDetail from '@/components/ProductDetail'
import ProductReviews from '@/components/ProductReviews'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
      <ProductDetail product={product} />
      <ProductReviews productId={product.id} />
    </div>
  )
}