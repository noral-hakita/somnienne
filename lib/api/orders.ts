// DATA ACCESS LAYER — orders. Today: simulated. Phase 3: real server action.
import type { WardrobeItem } from '@/store/wardrobeStore'

export interface CheckoutPayload {
  items: WardrobeItem[]
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
  // PHASE 3: this becomes a SERVER ACTION that:
  //  - re-reads every price from the database (never trusts the browser)
  //  - validates stock, creates the order as pending_confirmation
  //  - decrements stock, triggers the confirmation email/WhatsApp
  await new Promise((resolve) => setTimeout(resolve, 900))
  return { orderId: `SOM-${Date.now().toString().slice(-6)}` }
}