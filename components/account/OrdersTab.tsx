'use client'

import { useEffect, useState } from 'react'
import { Loader2, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface MyOrder {
  id: string
  status: string
  total: number
  created_at: string
  order_items: { name_snapshot: string; quantity: number; attributes_snapshot: { size?: string; color?: string } | null }[]
  shipments: { courier: string; tracking_number: string | null; status: string }[]
}

const badge: Record<string, string> = {
  pending_confirmation: 'bg-bronze/10 text-bronze',
  confirmed: 'bg-espresso/5 text-espresso',
  packed: 'bg-espresso/10 text-espresso',
  shipped: 'bg-bronze/10 text-bronze',
  delivered: 'bg-espresso text-ivory',
  cancelled: 'bg-red-700/10 text-red-700',
  returned: 'bg-red-700/10 text-red-700',
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<MyOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // No .eq('user_id') needed — RLS already returns only YOUR rows.
    createClient()
      .from('orders')
      .select('id, status, total, created_at, order_items(name_snapshot, quantity, attributes_snapshot), shipments(courier, tracking_number, status)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as MyOrder[])
        setLoading(false)
      })
  }, [])

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-bronze" />
  if (orders.length === 0)
    return <p className="font-serif italic text-taupe">No orders yet — your first dream awaits in the collection.</p>

  return (
    <div className="space-y-6">
      {orders.map((o) => (
        <div key={o.id} className="bg-ivory border border-sand p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-espresso text-sm font-medium">Order {o.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-taupe text-xs mt-1">{format(new Date(o.created_at), 'dd MMM yyyy, HH:mm')}</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-lg text-espresso">Rs. {Number(o.total).toLocaleString()}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] ${badge[o.status]}`}>
                {o.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="border-t border-sand pt-4 space-y-1">
            {o.order_items.map((it, i) => (
              <p key={i} className="text-sm text-espresso">
                {it.name_snapshot}
                {it.attributes_snapshot?.size ? ` · ${it.attributes_snapshot.size}` : ''}
                {it.attributes_snapshot?.color ? ` / ${it.attributes_snapshot.color}` : ''} × {it.quantity}
              </p>
            ))}
          </div>

          {o.shipments.length > 0 && (
            <div className="border-t border-sand mt-4 pt-4 space-y-1">
              {o.shipments.map((s, i) => (
                <p key={i} className="text-xs text-taupe flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-bronze" />
                  {s.courier} · Tracking: <span className="text-espresso">{s.tracking_number ?? 'assigned soon'}</span> · {s.status.replace('_', ' ')}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}