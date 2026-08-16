'use server'

import { createClient } from '@/lib/supabase/server'

export async function placeOrderServer(payload: {
  items: { variant_id: string; quantity: number; custom_notes?: string | null }[]
  full_name: string
  phone: string
  address: string
  city: string
  payment_method?: 'cod'
  coupon_code?: string | null
}): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('place_order', {
    items: payload.items,
    full_name: payload.full_name,
    phone: payload.phone,
    address: payload.address,
    city: payload.city,
    payment_method: payload.payment_method ?? 'cod',
    coupon_code: payload.coupon_code ?? null,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true, orderId: data as string }
}