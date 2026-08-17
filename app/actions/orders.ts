'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

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
  const orderId = data as string

  // Read our own fresh order (RLS allows reading your own rows)
  const { data: order } = await supabase
    .from('orders')
    .select('email, full_name, total, confirmation_token')
    .eq('id', orderId)
    .single()

  if (order) {
    try {
      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
      const short = orderId.slice(0, 8).toUpperCase()
      const confirmUrl = `${origin}/confirm?token=${order.confirmation_token}&action=confirm`
      const cancelUrl = `${origin}/confirm?token=${order.confirmation_token}&action=cancel`

      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Somnienne <onboarding@resend.dev>',
        to: order.email,
        subject: `Somnienne — one step for order ${short}`,
        html: `
<div style="background:#FAF7F1;padding:48px 24px;font-family:Georgia,serif;color:#221A12">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E2D5C0;padding:40px 32px;text-align:center">
    <p style="letter-spacing:0.4em;text-transform:uppercase;font-size:11px;color:#A87C4F;margin:0 0 16px">Somnienne</p>
    <h1 style="font-weight:400;font-size:26px;margin:0 0 8px">One step, ${order.full_name}.</h1>
    <p style="color:#8B7A6A;font-size:14px;line-height:1.7;margin:0 0 8px">
      Order ${short} · Rs. ${Number(order.total).toLocaleString()}
    </p>
    <p style="color:#8B7A6A;font-size:14px;line-height:1.7;margin:0 0 28px">
      We hold your pieces for 12 hours. Confirm to send the atelier to work,
      or cancel and we release them gently back to the collection.
    </p>
    <a href="${confirmUrl}" style="display:inline-block;background:#221A12;color:#FAF7F1;text-decoration:none;padding:14px 28px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;margin:0 6px">Confirm my order</a>
    <a href="${cancelUrl}" style="display:inline-block;border:1px solid #E2D5C0;color:#8B7A6A;text-decoration:none;padding:14px 28px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;margin:0 6px">Cancel</a>
    <p style="color:#8B7A6A;font-size:11px;margin:28px 0 0">No payment is taken online. Cash on delivery.</p>
  </div>
</div>`,
      })
    } catch (e) {
      // Email failure must NEVER kill the order — staff can confirm manually.
      console.error('confirmation email failed:', e)
    }
  }

  return { ok: true, orderId }
}