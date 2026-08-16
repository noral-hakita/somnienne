import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Clock, Package, Users, Coins } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: me } = await supabase.from('profiles').select('full_name').eq('id', user?.id).single()

  const { data: settingsRows } = await supabase.from('settings').select('key, value').eq('key', 'low_stock_threshold')
  const lowThreshold = Number(settingsRows?.[0]?.value ?? 5)

  const { count: pending } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending_confirmation')
  const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: customers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer')
  const { data: paid } = await supabase.from('orders').select('total').in('status', ['confirmed', 'packed', 'shipped', 'delivered'])
  const revenue = (paid ?? []).reduce((sum, o) => sum + Number(o.total), 0)

  const { data: recent } = await supabase
    .from('orders').select('id, full_name, total, status, created_at')
    .order('created_at', { ascending: false }).limit(8)
  const { data: lowStock } = await supabase
    .from('product_variants').select('sku, stock, products(name)')
    .lte('stock', lowThreshold).order('stock', { ascending: true }).limit(6)

  const stats = [
    { icon: Clock, label: 'Pending confirmation', value: pending ?? 0 },
    { icon: Package, label: 'Total orders', value: totalOrders ?? 0 },
    { icon: Coins, label: 'Revenue (PKR)', value: revenue.toLocaleString() },
    { icon: Users, label: 'Customers', value: customers ?? 0 },
  ]

  return (
    <div className="space-y-10">
      <div>
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-2">The Atelier</p>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-espresso">
          Welcome back, <span className="italic text-bronze">{me?.full_name ?? 'friend'}</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-ivory border border-sand p-6">
            <s.icon className="w-4 h-4 text-bronze mb-4" />
            <p className="font-serif text-2xl md:text-3xl text-espresso">{s.value}</p>
            <p className="text-taupe text-[10px] uppercase tracking-[0.2em] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-ivory border border-sand p-6">
          <h2 className="text-xs uppercase tracking-[0.25em] text-espresso mb-6">Recent orders</h2>
          {!recent || recent.length === 0 ? (
            <p className="font-serif italic text-taupe">No orders yet — the atelier awaits its first dream.</p>
          ) : (
            <div className="space-y-4">
              {recent.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-espresso">{o.full_name}</p>
                    <p className="text-taupe text-xs">{format(new Date(o.created_at), 'dd MMM, HH:mm')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-espresso">Rs. {Number(o.total).toLocaleString()}</p>
                    <p className="text-bronze text-[10px] uppercase tracking-[0.15em]">{o.status.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-ivory border border-sand p-6">
          <h2 className="text-xs uppercase tracking-[0.25em] text-espresso mb-6">Low stock alerts</h2>
          {!lowStock || lowStock.length === 0 ? (
            <p className="font-serif italic text-taupe">Nothing to create yet — listings arrive in the next round.</p>
          ) : (
            <div className="space-y-4">
              {lowStock.map((v) => (
                <div key={v.sku} className="flex items-center justify-between text-sm">
                  <p className="text-espresso">{(v.products as any)?.name ?? (v.products as any)?.[0]?.name ?? 'Unknown'} · <span className="text-taupe">{v.sku}</span></p>
                  <p className={v.stock === 0 ? 'text-red-700' : 'text-bronze'}>{v.stock === 0 ? 'Out' : `${v.stock} left`}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}