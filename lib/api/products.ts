import { createClient } from '@/lib/supabase/server'

export interface StoreVariant {
  id: string
  sku: string
  size: string
  color: string
  stock: number
  isCustom: boolean
}

export interface StoreCategory {
  id: string
  name: string
  slug: string
}

export interface StoreProduct {
  id: string
  name: string
  slug: string
  price: number
  imageGradient: string
  images: string[]
  shortDescription: string
  fullDescription: string
  categoryName: string | null
  customLeadTimeDays: number
  variants: StoreVariant[]
}

const mapVariants = (rows: any[]): StoreVariant[] =>
  (rows ?? []).map((v) => ({
    id: v.id,
    sku: v.sku,
    size: v.attributes?.size ?? 'One Size',
    color: v.attributes?.color ?? 'Default',
    stock: v.stock,
    isCustom: v.is_custom,
  }))

const mapImages = (rows: any[]): string[] =>
  ((rows ?? []) as { url: string; position: number }[])
    .sort((a, b) => a.position - b.position)
    .map((m) => m.url)

const SELECT =
  'id, name, slug, retail_price, sale_price, short_description, full_description, custom_lead_time_days, categories(name), product_variants(id, sku, attributes, stock, is_custom, image_url), product_media(url, type, position)'

export async function getCategories(): Promise<StoreCategory[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories').select('id, name, slug')
    .eq('is_active', true).order('sort_order')
  return data ?? []
}

export async function getProducts(): Promise<StoreProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products').select(SELECT)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return (data as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.sale_price ?? p.retail_price),
    imageGradient: p.product_variants?.[0]?.image_url ?? 'from-ivory to-sand',
    images: mapImages(p.product_media),
    shortDescription: p.short_description ?? '',
    fullDescription: p.full_description ?? '',
    categoryName: p.categories?.name ?? null,
    customLeadTimeDays: p.custom_lead_time_days ?? 7,
    variants: mapVariants(p.product_variants),
  }))
}

export async function getProductById(id: string): Promise<StoreProduct | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products').select(SELECT)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !data) return undefined
  const p = data as any

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.sale_price ?? p.retail_price),
    imageGradient: p.product_variants?.[0]?.image_url ?? 'from-ivory to-sand',
    images: mapImages(p.product_media),
    shortDescription: p.short_description ?? '',
    fullDescription: p.full_description ?? '',
    categoryName: p.categories?.name ?? null,
    customLeadTimeDays: p.custom_lead_time_days ?? 7,
    variants: mapVariants(p.product_variants),
  }
}
export async function getFeaturedProducts(): Promise<StoreProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, slug, retail_price, sale_price, short_description, full_description, custom_lead_time_days, categories(name), product_variants(id, sku, attributes, stock, is_custom, image_url), product_media(url, type, position)'
    )
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(4)

  if (error || !data) return []

  return (data as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.sale_price ?? p.retail_price),
    imageGradient: p.product_variants?.[0]?.image_url ?? 'from-ivory to-sand',
    images: ((p.product_media ?? []) as { url: string; position: number }[])
      .sort((a, b) => a.position - b.position)
      .map((m) => m.url),
    shortDescription: p.short_description ?? '',
    fullDescription: p.full_description ?? '',
    categoryName: p.categories?.name ?? null,
    customLeadTimeDays: p.custom_lead_time_days ?? 7,
    variants: mapVariants(p.product_variants),
  }))
}