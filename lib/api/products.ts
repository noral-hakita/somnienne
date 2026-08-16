import { createClient } from '@/lib/supabase/server'

export interface StoreProduct {
  id: string
  name: string
  price: number
  imageGradient: string
  shortDescription: string
  fullDescription: string
  slug: string
}

export async function getProducts(): Promise<StoreProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, retail_price, sale_price, short_description, full_description, product_variants(image_url)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.sale_price ?? p.retail_price),
    imageGradient: p.product_variants[0]?.image_url ?? 'from-ivory to-sand',
    shortDescription: p.short_description ?? '',
    fullDescription: p.full_description ?? '',
  }))
}

export async function getProductById(id: string): Promise<StoreProduct | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, retail_price, sale_price, short_description, full_description, product_variants(image_url)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !data) return undefined

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    price: Number(data.sale_price ?? data.retail_price),
    imageGradient: data.product_variants[0]?.image_url ?? 'from-ivory to-sand',
    shortDescription: data.short_description ?? '',
    fullDescription: data.full_description ?? '',
  }
}