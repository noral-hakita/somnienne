'use client'

import { useEffect, useState } from 'react'
import { Loader2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Reviewable { product_id: string; name: string }
interface MyReview { id: string; product_id: string; rating: number; body: string; is_approved: boolean }

export default function ReviewsTab() {
  const [reviewable, setReviewable] = useState<Reviewable[]>([])
  const [reviews, setReviews] = useState<MyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState<Record<string, number>>({})
  const [body, setBody] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const [ordersRes, reviewsRes] = await Promise.all([
      supabase.from('orders').select('id, order_items(product_id, name_snapshot)').eq('status', 'delivered'),
      supabase.from('reviews').select('id, product_id, rating, body, is_approved'),
    ])
    const reviewed = new Set((reviewsRes.data ?? []).map((r) => r.product_id))
    const seen = new Set<string>()
    const list: Reviewable[] = []
    for (const o of (ordersRes.data ?? []) as { id: string; order_items: { product_id: string; name_snapshot: string }[] }[]) {
      for (const it of o.order_items ?? []) {
        if (!reviewed.has(it.product_id) && !seen.has(it.product_id)) {
          seen.add(it.product_id)
          list.push({ product_id: it.product_id, name: it.name_snapshot })
        }
      }
    }
    setReviewable(list)
    setReviews((reviewsRes.data ?? []) as MyReview[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const submit = async (productId: string) => {
    const r = rating[productId]
    const b = body[productId]
    if (!r || !b?.trim()) return
    setBusyId(productId)
    const { error } = await supabase.from('reviews').insert({ product_id: productId, rating: r, body: b.trim() })
    if (error) alert(error.message)
    setBusyId(null)
    load()
  }

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-bronze" />

  return (
    <div className="space-y-8">
      {/* Rate delivered purchases */}
      <div>
        <h2 className="text-xs uppercase tracking-[0.25em] text-espresso mb-4">Rate your delivered orders</h2>
        {reviewable.length === 0 ? (
          <p className="font-serif italic text-taupe">Nothing waiting for a review. Verified buyers only — that's what makes Somnienne reviews trustworthy.</p>
        ) : (
          <div className="space-y-6">
            {reviewable.map((p) => (
              <div key={p.product_id} className="bg-ivory border border-sand p-6">
                <p className="text-espresso text-sm font-medium mb-3">{p.name}</p>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating({ ...rating, [p.product_id]: n })}>
                      <Star className={`w-5 h-5 transition-colors ${(rating[p.product_id] ?? 0) >= n ? 'text-bronze fill-bronze' : 'text-sand'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  placeholder="How did it sleep?"
                  value={body[p.product_id] ?? ''}
                  onChange={(e) => setBody({ ...body, [p.product_id]: e.target.value })}
                  className="w-full bg-transparent border border-sand px-4 py-3 text-espresso placeholder:text-taupe/50 focus:border-bronze outline-none transition-colors resize-none"
                />
                <button
                  onClick={() => submit(p.product_id)}
                  disabled={busyId === p.product_id}
                  className="mt-3 bg-espresso text-ivory px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] hover:bg-bronze transition-colors disabled:opacity-50"
                >
                  Submit review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My reviews */}
      <div>
        <h2 className="text-xs uppercase tracking-[0.25em] text-espresso mb-4">Your reviews</h2>
        {reviews.length === 0 ? (
          <p className="font-serif italic text-taupe">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-ivory border border-sand p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-3.5 h-3.5 ${r.rating >= n ? 'text-bronze fill-bronze' : 'text-sand'}`} />
                    ))}
                  </div>
                  <p className="text-taupe text-sm">{r.body}</p>
                </div>
                <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 whitespace-nowrap ${r.is_approved ? 'bg-espresso text-ivory' : 'bg-bronze/10 text-bronze'}`}>
                  {r.is_approved ? 'Published' : 'Awaiting approval'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}