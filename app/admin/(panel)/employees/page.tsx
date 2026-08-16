'use client'

import { useEffect, useState } from 'react'
import { Loader2, UserCog, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ProfileRow {
  id: string
  full_name: string | null
  role: string
  is_active: boolean
}

const STAFF_ROLES = ['owner', 'operations', 'support']

export default function EmployeesPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [meId, setMeId] = useState<string | null>(null)
  const [myRole, setMyRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('profiles').select('id, full_name, role, is_active').order('created_at')
    setProfiles((data ?? []) as ProfileRow[])
    const me = (data ?? []).find((p) => p.id === user?.id)
    setMeId(user?.id ?? null)
    setMyRole(me?.role ?? null)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const isOwner = myRole === 'owner'

  const update = async (id: string, args: { new_role?: string; active?: boolean }) => {
    setBusyId(id)
    const { error } = await supabase.rpc('admin_update_staff', {
      target: id,
      new_role: args.new_role ?? null,
      active: args.active ?? null,
    })
    if (error) alert(error.message)
    setBusyId(null)
    load()
  }

  const staff = profiles.filter((p) => STAFF_ROLES.includes(p.role))
  const customers = profiles.filter((p) => p.role === 'customer')

  return (
    <div className="space-y-8">
      <div>
        <p className="text-bronze text-[10px] uppercase tracking-[0.4em] mb-2">People</p>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-espresso">
          Emplo<span className="italic text-bronze">yees</span>
        </h1>
        {!isOwner && (
          <p className="text-taupe text-sm mt-2">Only the owner can change roles or deactivate staff.</p>
        )}
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-bronze" />
      ) : (
        <>
          {/* Staff */}
          <div className="bg-ivory border border-sand p-6">
            <h2 className="text-xs uppercase tracking-[0.25em] text-espresso mb-6 flex items-center gap-2">
              <UserCog className="w-4 h-4 text-bronze" /> Staff
            </h2>
            <div className="space-y-3">
              {staff.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border border-sand px-4 py-3">
                  <div>
                    <p className="text-espresso text-sm">
                      {p.full_name ?? '—'}
                      {p.id === meId && <span className="ml-2 text-[9px] uppercase tracking-[0.2em] bg-bronze text-ivory px-2 py-0.5">You</span>}
                      {!p.is_active && <span className="ml-2 text-[9px] uppercase tracking-[0.2em] bg-red-700/10 text-red-700 px-2 py-0.5">Deactivated</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={p.role}
                      disabled={!isOwner || p.id === meId || busyId === p.id}
                      onChange={(e) => update(p.id, { new_role: e.target.value })}
                      className="border border-sand bg-transparent px-3 py-1.5 text-xs text-espresso focus:border-bronze outline-none disabled:opacity-50"
                    >
                      {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button
                      onClick={() => update(p.id, { active: !p.is_active })}
                      disabled={!isOwner || p.id === meId || busyId === p.id}
                      className={`px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] border transition-colors disabled:opacity-50 ${
                        p.is_active
                          ? 'border-sand text-taupe hover:border-red-700 hover:text-red-700'
                          : 'border-espresso text-espresso hover:bg-espresso hover:text-ivory'
                      }`}
                    >
                      {p.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customers */}
          <div className="bg-ivory border border-sand p-6">
            <h2 className="text-xs uppercase tracking-[0.25em] text-espresso mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-bronze" /> Customers — promote to staff
            </h2>
            {customers.length === 0 ? (
              <p className="font-serif italic text-taupe">No customer accounts yet.</p>
            ) : (
              <div className="space-y-3">
                {customers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border border-sand px-4 py-3">
                    <p className="text-espresso text-sm">{p.full_name ?? p.id.slice(0, 8)}</p>
                    <button
                      onClick={() => update(p.id, { new_role: 'support' })}
                      disabled={!isOwner || busyId === p.id}
                      className="px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] border border-espresso text-espresso hover:bg-espresso hover:text-ivory transition-colors disabled:opacity-50"
                    >
                      Make staff (support)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}