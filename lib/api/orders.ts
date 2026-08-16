import type { WardrobeItem } from '@/store/wardrobeStore'

export interface CheckoutPayload {
  items: { variant_id: string; quantity: number; custom_notes?: string | null }[]
  customer: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    zoneId: string
  }
  paymentMethod: 'cod'
  subtotal: number
  shippingFee: number
  total: number
}

export async function placeOrder(payload: CheckoutPayload): Promise<{ orderId: string }> {
  // PHASE 3: becomes the real place_order() RPC — server re-prices everything
  await new Promise((resolve) => setTimeout(resolve, 900))
  return { orderId: `SOM-${Date.now().toString().slice(-6)}` }
}

export type { WardrobeItem }