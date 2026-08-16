'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, ShieldCheck, Truck } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useWardrobeStore, wardrobeLineKey } from '@/store/wardrobeStore'
import { getShippingFee } from '@/lib/api/shipping'
import { placeOrderServer } from '@/app/actions/orders'
import GoogleButton from '@/components/GoogleButton'

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot', 'Other']

function AuthPanel() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const { error } =
      tab === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
    if (error) {
      setError(error.message)
      setBusy(false)
    }
  }

  const inputCls =
    'w-full bg-transparent border border-sand px-4 py-3 text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors'

  return (
    <div className="bg-linen border border-sand p-8">
      <div className="flex border-b border-sand mb-6">
        {(['login', 'signup'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 pb-3 text-[10px] uppercase tracking-[0.25em] transition-colors ${
              tab === t ? 'text-espresso border-b border-bronze' : 'text-taupe hover:text-espresso'
            }`}
          >
            {t === 'login' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {tab === 'signup' && (
          <input className={inputCls} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={inputCls} type="password" placeholder="Password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-espresso text-ivory py-4 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : tab === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="flex-1 h-px bg-sand" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-taupe">or</span>
        <span className="flex-1 h-px bg-sand" />
      </div>

      <GoogleButton redirectTo={window.location.origin + '/checkout'} />
    </div>
  )
}

export default function CheckoutPage() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [shippingFee, setShippingFee] = useState<number | null>(null)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState<string | null>(null)

  const { items, getSubtotal, clearWardrobe } = useWardrobeStore()
  const subtotal = getSubtotal()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    getShippingFee(subtotal).then(setShippingFee)
  }, [subtotal])

  useEffect(() => {
    if (user) {
      setFullName((user.user_metadata?.full_name as string) ?? '')
      setEmail(user.email ?? '')
    }
  }, [user])

  const total = subtotal - discount + (shippingFee ?? 0)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    const supabase = createClient()
    const { data } = await supabase.rpc('validate_coupon', { code: couponCode, subtotal })
    const res = data as { valid: boolean; discount?: number; message?: string; code?: string } | null
    if (res?.valid) {
      setDiscount(Number(res.discount ?? 0))
      setCouponMsg(`Code ${res.code} applied`)
    } else {
      setDiscount(0)
      setCouponMsg(res?.message ?? 'Invalid code')
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (shippingFee === null) {
      setError('Shipping is being calculated — one moment.')
      return
    }
    setPlacing(true)
    setError(null)

    const result = await placeOrderServer({
      items: items.map((i) => ({
        variant_id: i.variantId ?? i.id,
        quantity: i.quantity,
        custom_notes: i.customNotes ?? null,
      })),
      full_name: fullName,
      phone,
      address,
      city,
      payment_method: 'cod',
      coupon_code: discount > 0 ? couponCode : null,
    })

    if (!result.ok) {
      setError(result.error)
      setPlacing(false)
      return
    }

    clearWardrobe()
    setPlacedOrderId(result.orderId)
  }

  const inputCls =
    'w-full bg-transparent border border-sand px-4 py-3 text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors'
  const labelCls = 'block text-[10px] uppercase tracking-[0.25em] text-taupe mb-2'

  if (placedOrderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-4">
          Order {placedOrderId.slice(0, 8).toUpperCase()}
        </p>
        <h1 className="font-serif text-4xl md:text-6xl font-light text-espresso mb-6">
          Your order is with <span className="italic text-bronze">our atelier</span>
        </h1>
        <p className="text-taupe max-w-md mb-10">
          We will confirm it via email and WhatsApp shortly. Your order is reserved for 12 hours awaiting your confirmation.
        </p>
        <Link href="/collection" className="bg-espresso text-ivory px-10 py-4 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors">
          Continue exploring
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-4xl text-espresso mb-4">Your Wardrobe is empty</h1>
        <Link href="/collection" className="text-bronze underline underline-offset-4 text-sm">
          Explore the Collection
        </Link>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-bronze" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
      <h1 className="font-serif text-4xl md:text-5xl font-light text-espresso mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          {!user ? (
            <>
              <p className="text-taupe text-sm mb-6">
                Sign in or create your account to continue. Your Wardrobe is safe — it will still be here.
              </p>
              <AuthPanel />
            </>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Full name</label>
                  <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <label className={labelCls}>Email (linked to your account)</label>
                  <input className={`${inputCls} opacity-60`} type="email" value={email} readOnly />
                </div>
              </div>
              <div>
                <label className={labelCls}>Phone (WhatsApp & calls)</label>
                <input className={inputCls} type="tel" placeholder="+92 300 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Delivery address</label>
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="House, street, area" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <select className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} required>
                  <option value="">Select your city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="text-taupe text-xs mt-2 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-bronze" /> Delivery in 3–5 working days, nationwide
                </p>
              </div>

              <div>
                <label className={labelCls}>Payment method</label>
                <div className="space-y-3">
                  <div className="border border-bronze bg-linen px-4 py-3 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full border border-bronze bg-bronze" />
                    <span className="text-sm text-espresso">Cash on Delivery — pay when it arrives</span>
                  </div>
                  <div className="border border-sand px-4 py-3 flex items-center gap-3 opacity-50">
                    <span className="w-3 h-3 rounded-full border border-sand" />
                    <span className="text-sm text-taupe">Card / JazzCash / Easypais — coming soon</span>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={placing}
                className="w-full bg-espresso text-ivory py-4 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Place Order'}
              </button>

              <p className="text-taupe text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-bronze" />
                No payment is taken online. Your order is confirmed by you via email/WhatsApp.
              </p>
            </form>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-linen border border-sand p-8 sticky top-32">
            <h2 className="font-serif text-2xl text-espresso mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm divide-y divide-sand">
              {items.map((item) => (
                <div key={wardrobeLineKey(item)} className="flex justify-between py-3">
                  <span className="text-taupe">
                    {item.name}{item.attributes ? ` · ${item.attributes}` : ''} × {item.quantity}
                  </span>
                  <span className="text-espresso">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mt-6">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="flex-1 bg-transparent border border-sand px-3 py-2 text-xs text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="px-4 py-2 border border-espresso text-espresso text-[10px] uppercase tracking-[0.2em] hover:bg-espresso hover:text-ivory transition-colors"
              >
                Apply
              </button>
            </div>
            {couponMsg && <p className="text-taupe text-xs mt-2">{couponMsg}</p>}

            <div className="space-y-3 text-sm mt-6">
              <div className="flex justify-between text-taupe">
                <span>Subtotal</span>
                <span className="text-espresso">Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-taupe">
                  <span>Coupon</span>
                  <span className="text-bronze">− Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-taupe">
                <span>Shipping</span>
                {shippingFee === null ? (
                  <span className="italic text-taupe/70">Calculating…</span>
                ) : shippingFee === 0 ? (
                  <span className="text-bronze">Complimentary</span>
                ) : (
                  <span className="text-espresso">Rs. {shippingFee.toLocaleString()}</span>
                )}
              </div>
              <div className="border-t border-sand pt-4 flex justify-between text-lg">
                <span className="font-serif text-espresso">Total</span>
                <span className="font-serif text-espresso">Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}