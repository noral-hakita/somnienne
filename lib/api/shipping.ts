// DATA ACCESS LAYER — shipping. Today: flat national rate.
// PHASE 3 (v2): swap for live courier quotes (TCS/PostEx API) or zone/weight tables.
export const FLAT_SHIPPING_FEE = 250
export const FREE_SHIPPING_THRESHOLD = 15000

export async function getShippingFee(subtotal: number): Promise<number> {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE
}