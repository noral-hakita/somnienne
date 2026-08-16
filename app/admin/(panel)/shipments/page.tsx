'use client'

import { useEffect, useState } from 'react'
import { Loader2, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface ShipmentRow {
  id: string
  courier: string
  tracking_number: string | null
  status: string
  shipped_at: string | null
  orders: { id: string; full_name: string; city: string; status: string } | null
}

export default function ShipmentsPage() {
  const [rows, setRows] = useState<ShipmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('shipments')
      .select('*, orders(id, full_name, city, status)')
      .order('created_at', { ascending: false })
    setRows((data ?? []) as ShipmentRow[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const markDelivered = async (orderId: string) => {
    setBusyId(orderId)
    const { error } = await supabase.rpc('admin_advance_order', { p_order_id: orderId, p_new_status: 'delivered' } as never)
    if (error) alert(error.message)
    setBusyId(null)
    load()
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-2">Logistics</p>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-espresso">
          Ship<span className="italic text-bronze">ments</span>
        </h1>
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-bronze" />
      ) : rows.length === 0 ? (
        <div className="bg-ivory border border-sand p-12 text-center">
          <Truck className="w-8 h-8 text-taupe/40 mx-auto mb-4" />
          <p className="font-serif italic text-taupe">No parcels on the road yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((s) => (
            <div key={s.id} className="bg-ivory border border-sand p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-espresso text-sm font-medium">{s.orders?.full_name} · {s.orders?.city}</p>
                <p className="text-taupe text-xs mt-1">
                  {s.courier} · <span className="text-espresso">{s.tracking_number}</span>
                  {s.shipped_at && ` · ${format(new Date(s.shipped_at), 'dd MMM')}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] ${s.status === 'delivered' ? 'bg-espresso text-ivory' : 'bg-bronze/10 text-bronze'}`}>
                  {s.status.replace('_', ' ')}
                </span>
                {s.orders?.status === 'shipped' && (
                  <button onClick={() => markDelivered(s.orders!.id)} disabled={busyId === s.orders!.id}
                    className="bg-espresso text-ivory px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-bronze transition-colors disabled:opacity-50">
                    Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}