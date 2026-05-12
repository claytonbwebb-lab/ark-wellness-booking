'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

export default function Nav() {
  const [user, setUser] = useState<Profile | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => setUser(data))
      }
    })
  }, [])

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        The <span>Ark</span>
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link href="/dashboard">My Bookings</Link>
            {user.role === 'admin' && <Link href="/admin">Admin</Link>}
            <button
              onClick={() => supabase.auth.signOut().then(() => setUser(null))}
              style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.65)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Sign In</Link>
            <Link href="/book" className="nav-cta">Book Now</Link>
          </>
        )}
      </div>
    </nav>
  )
}
