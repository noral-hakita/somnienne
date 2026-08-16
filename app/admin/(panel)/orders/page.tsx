'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

const FILTERS = ['all', 'pending_confirmation', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'] as const
const COURIERS = ['TCS', 'Leopards', 'PostEx', 'BlueEx', 'Other']

const badge: Record<string, string> = {
  pending_confirmation: 'bg-bronze/10 text-bronze',
  confirmed: 'bg-espresso/5 text-espresso',
  packed: 'bg-espresso/10 text-espresso',
  shipped: 'bg-bronze/10 text-bronze',
  delivered: 'bg-espresso text-ivory',
  cancelled: 'bg-red-700/10 text-red-700',
  returned: 'bg-red-700/10 text-red-700',
}

interface OrderRow {
  id: string
  full_name: string
  phone: string
  city: string
  address: string
  total: number
  status: string
  created_at: string
  order_items: { name_snapshot: string; quantity: number; attributes_snapshot: { size?: string; color?: string } | null }[]
  shipments: { courier: string; tracking_number: string | null }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [courier, setCourier] = useState<Record<string, string>>({})
  const [tracking, setTracking] = useState<Record<string, string>>({})

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(name_snapshot, quantity, attributes_snapshot), shipments(courier, tracking_number)')
      .order('created_at', { ascending: false })
    setOrders((data ?? []) as OrderRow[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const advance = async (id: string, status: string) => {
    setBusyId(id)
    const args: Record<string, unknown> = { p_order_id: id, p_new_status: status }
    if (status === 'shipped') {
      if (!tracking[id]?.trim()) {
        alert('Enter the tracking number first.')
        setBusyId(null)
        return
      }
      args.p_courier = courier[id] ?? 'TCS'
      args.p_tracking = tracking[id]
    }
    const { error } = await supabase.rpc('admin_advance_order', args as never)
    if (error) alert(error.message)
    setBusyId(null)
    load()
  }

  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-2">Operations</p>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-espresso">
          All <span className="italic text-bronze">orders</span>
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-colors ${
              filter === f ? 'bg-espresso text-ivory border-espresso' : 'border-sand text-taupe hover:border-bronze'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-bronze" />
      ) : visible.length === 0 ? (
        <p className="font-serif italic text-taupe">No orders in this state.</p>
      ) : (
        <div className="space-y-6">
          {visible.map((o) => (
            <div key={o.id} className="bg-ivory border border-sand p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-espresso font-medium">
                    {o.full_name} <span className="text-taupe font-normal text-xs">· {o.id.slice(0, 8).toUpperCase()}</span>
                  </p>
                  <p className="text-taupe text-xs mt-1">{o.phone} · {o.city} · {format(new Date(o.created_at), 'dd MMM, HH:mm')}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-xl text-espresso">Rs. {Number(o.total).toLocaleString()}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] ${badge[o.status]}`}>
                    {o.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="border-t border-sand pt-4 mb-4 space-y-1">
                {o.order_items.map((it, i) => (
                  <p key={i} className="text-sm text-espresso">
                    {it.name_snapshot}
                    {it.attributes_snapshot?.size ? ` · ${it.attributes_snapshot.size}` : ''}
                    {it.attributes_snapshot?.color ? ` / ${it.attributes_snapshot.color}` : ''} × {it.quantity}
                  </p>
                ))}
                <p className="text-taupe text-xs mt-2">{o.address}</p>
              </div>

              {/* Lifecycle actions */}
              <div className="border-t border-sand pt-4">
                {o.status === 'pending_confirmation' && (
                  <p className="text-taupe text-xs italic">Awaiting customer confirmation — manage in Pending Orders.</p>
                )}
                {o.status === 'confirmed' && (
                  <button onClick={() => advance(o.id, 'packed')} disabled={busyId === o.id}
                    className="bg-espresso text-ivory px-6 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-bronze transition-colors disabled:opacity-50">
                    Mark packed
                  </button>
                )}
                {o.status === 'packed' && (
                  <div className="flex flex-wrap items-center gap-3">
                    <select value={courier[o.id] ?? 'TCS'} onChange={(e) => setCourier({ ...courier, [o.id]: e.target.value })}
                      className="border border-sand bg-transparent px-3 py-2 text-xs text-espresso focus:border-bronze outline-none">
                      {COURIERS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <input value={tracking[o.id] ?? ''} onChange={(e) => setTracking({ ...tracking, [o.id]: e.target.value })}
                      placeholder="Tracking number"
                      className="flex-1 min-w-40 border border-sand bg-transparent px-3 py-2 text-xs text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none" />
                    <button onClick={() => advance(o.id, 'shipped')} disabled={busyId === o.id}
                      className="bg-espresso text-ivory px-6 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-bronze transition-colors disabled:opacity-50">
                      Ship order
                    </button>
                  </div>
                )}
                {o.status === 'shipped' && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-taupe text-xs">
                      {o.shipments[0]?.courier} · <span className="text-espresso">{o.shipments[0]?.tracking_number}</span>
                    </p>
                    <button onClick={() => advance(o.id, 'delivered')} disabled={busyId === o.id}
                      className="bg-espresso text-ivory px-6 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-bronze transition-colors disabled:opacity-50">
                      Mark delivered
                    </button>
                  </div>
                )}
                {(o.status === 'delivered' || o.status === 'cancelled' || o.status === 'returned') && (
                  <p className="text-taupe text-xs italic">Order closed.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}