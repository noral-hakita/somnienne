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

export interface StoreMedia {
  url: string
  color: string | null
}

export interface StoreProduct {
  id: string
  name: string
  slug: string
  price: number
  imageGradient: string
  images: string[]
  media: StoreMedia[]
  shortDescription: string
  fullDescription: string
  careInstructions: string | null
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

const mapMedia = (rows: any[]): StoreMedia[] =>
  ((rows ?? []) as any[])
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((m) => ({ url: m.url, color: m.color ?? null }))

const SELECT =
  'id, name, slug, retail_price, sale_price, short_description, full_description, care_instructions, custom_lead_time_days, categories(name), product_variants(id, sku, attributes, stock, is_custom, image_url), product_media(url, color, position)'

const mapProduct = (p: any): StoreProduct => {
  const media = mapMedia(p.product_media)
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.sale_price ?? p.retail_price),
    imageGradient: p.product_variants?.[0]?.image_url ?? 'from-ivory to-sand',
    images: media.map((m) => m.url),
    media,
    shortDescription: p.short_description ?? '',
    fullDescription: p.full_description ?? '',
    careInstructions: p.care_instructions ?? null,
    categoryName: p.categories?.name ?? null,
    customLeadTimeDays: p.custom_lead_time_days ?? 7,
    variants: mapVariants(p.product_variants),
  }
}

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
  return (data as any[]).map(mapProduct)
}

export async function getFeaturedProducts(): Promise<StoreProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products').select(SELECT)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(4)
  if (error || !data) return []
  return (data as any[]).map(mapProduct)
}

export async function getProductById(id: string): Promise<StoreProduct | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products').select(SELECT)
    .eq('id', id)
    .eq('is_active', true)
    .single()
  if (error || !data) return undefined
  return mapProduct(data)
}
export async function getShowcase(): Promise<{ products: StoreProduct[]; categoryName: string } | null> {
  const supabase = await createClient()
  const { data: catId } = await supabase.rpc('get_showcase_category')
  if (!catId) return null

  const { data: cat } = await supabase.from('categories').select('name').eq('id', catId).single()
  const { data } = await supabase
    .from('products').select(SELECT)
    .eq('is_active', true)
    .eq('category_id', catId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!data || data.length === 0) return null
  return { products: (data as any[]).map(mapProduct), categoryName: cat?.name ?? 'The Collection' }
}