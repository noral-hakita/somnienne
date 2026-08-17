import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const COPY: Record<string, { title: string; body: string }> = {
  confirmed: {
    title: 'Confirmed.',
    body: 'The atelier begins. We will pack your order with care and share tracking the moment it ships.',
  },
  cancelled: {
    title: 'Cancelled.',
    body: 'Your order is cancelled and your pieces released back to the collection. No hard feelings.',
  },
  already_processed: {
    title: 'Already handled.',
    body: 'This order was already confirmed or cancelled. Nothing more to do.',
  },
  invalid: {
    title: 'Link not recognized.',
    body: 'This confirmation link is invalid or has expired. If you need help, write to the atelier.',
  },
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; action?: string }>
}) {
  const { token, action } = await searchParams

  let result = 'invalid'
  if (token && (action === 'confirm' || action === 'cancel')) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('confirm_order', { token, action })
    if (!error && data) result = data as string
  }

  const copy = COPY[result] ?? COPY.invalid

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-4">Somnienne</p>
      <h1 className="font-serif text-4xl md:text-6xl font-light text-espresso mb-6">{copy.title}</h1>
      <p className="text-taupe max-w-md mb-10">{copy.body}</p>
      <Link
        href="/collection"
        className="bg-espresso text-ivory px-10 py-4 text-xs uppercase tracking-[0.25em] hover:bg-bronze transition-colors"
      >
        Back to the boutique
      </Link>
    </div>
  )
}