'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle, Inbox } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface PendingOrder {
  id: string
  full_name: string
  phone: string
  city: string
  address: string
  total: number
  payment_method: string
  created_at: string
  order_items: {
    name_snapshot: string
    quantity: number
    attributes_snapshot: { size?: string; color?: string } | null
    custom_notes: string | null
  }[]
}

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(name_snapshot, quantity, attributes_snapshot, custom_notes)')
      .eq('status', 'pending_confirmation')
      .order('created_at', { ascending: true })
    setOrders((data ?? []) as PendingOrder[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (id: string, action: 'confirm' | 'cancel') => {
    setBusyId(id)
    if (action === 'confirm') {
      await supabase.rpc('admin_confirm_order', { order_id: id })
    } else {
      await supabase.rpc('admin_cancel_order', { order_id: id, reason: 'Cancelled by staff' })
    }
    setBusyId(null)
    load()
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-2">Awaiting confirmation</p>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-espresso">
          Pending <span className="italic text-bronze">orders</span>
        </h1>
        <p className="text-taupe text-sm mt-2">
          Orders stay here until the customer confirms (or you do, by phone/WhatsApp). After 12 hours they auto‑cancel.
        </p>
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-bronze" />
      ) : orders.length === 0 ? (
        <div className="bg-ivory border border-sand p-12 text-center">
          <Inbox className="w-8 h-8 text-taupe/40 mx-auto mb-4" />
          <p className="font-serif italic text-taupe">No orders awaiting confirmation. The atelier is quiet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div key={o.id} className="bg-ivory border border-sand p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-espresso font-medium">{o.full_name}</p>
                  <p className="text-taupe text-xs mt-1">
                    {o.phone} · {o.city} · {format(new Date(o.created_at), 'dd MMM, HH:mm')}
                  </p>
                  <p className="text-taupe text-xs mt-1">{o.address}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-xl text-espresso">Rs. {Number(o.total).toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-bronze mt-1">{o.payment_method === 'cod' ? 'Cash on Delivery' : o.payment_method}</p>
                </div>
              </div>

              <div className="border-t border-sand pt-4 mb-6 space-y-2">
                {o.order_items.map((it, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-espresso">
                      {it.name_snapshot}
                      {it.attributes_snapshot?.size ? ` · ${it.attributes_snapshot.size}` : ''}
                      {it.attributes_snapshot?.color ? ` / ${it.attributes_snapshot.color}` : ''}
                      {' '}× {it.quantity}
                    </span>
                    {it.custom_notes && <span className="text-bronze text-xs italic">“{it.custom_notes}”</span>}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => act(o.id, 'confirm')}
                  disabled={busyId === o.id}
                  className="flex-1 bg-espresso text-ivory py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm order
                </button>
                <button
                  onClick={() => act(o.id, 'cancel')}
                  disabled={busyId === o.id}
                  className="flex-1 border border-sand text-taupe py-3 text-[10px] uppercase tracking-[0.2em] hover:border-red-700 hover:text-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}