// ────────────────────────────────────────────────────────────
// DATA ACCESS LAYER — the ONLY file that knows where data lives.
// Today: mock data. Phase 3: Supabase. The UI never notices.
// ────────────────────────────────────────────────────────────
import { mockProducts } from '@/data/mockProducts'

export interface StoreProduct {
  id: string
  name: string
  price: number
  imageGradient: string
  shortDescription: string
  fullDescription: string
}

export async function getProducts(): Promise<StoreProduct[]> {
  // PHASE 3: return supabase.from('products').select(...)
  return mockProducts
}

export async function getProductById(id: string): Promise<StoreProduct | undefined> {
  // PHASE 3: return supabase...eq('id', id)
  return mockProducts.find((p) => p.id === id)
}