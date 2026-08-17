import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Star } from 'lucide-react'

export default async function ProductReviews({ productId }: { productId: string }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('rating, body, created_at')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (!data || data.length === 0) return null

  return (
    <div className="mt-12 border-t border-sand pt-8">
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-espresso font-medium mb-6">
        Reviews ({data.length}) — verified buyers only
      </h3>
      <div className="space-y-4">
        {data.map((r, i) => (
          <div key={i} className="border border-sand bg-ivory p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-3.5 h-3.5 ${r.rating >= n ? 'text-bronze fill-bronze' : 'text-sand'}`} />
                ))}
              </div>
              <span className="text-taupe text-xs">{format(new Date(r.created_at), 'dd MMM yyyy')}</span>
            </div>
            <p className="text-bronze text-[10px] uppercase tracking-[0.2em] mb-1">Verified buyer</p>
            <p className="text-taupe text-sm leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}