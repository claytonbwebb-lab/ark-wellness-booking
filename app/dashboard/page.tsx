'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'
import type { Booking } from '@/lib/types'

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DashboardPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)
      fetchBookings(session.user.id)
    })
  }, [])

  async function fetchBookings(userId: string) {
    const { data } = await supabase
      .from('bookings')
      .select('*, locations(name, address)')
      .eq('user_id', userId)
      .order('date', { ascending: true })
    setBookings(data ?? [])
    setLoading(false)
  }

  async function cancelBooking(id: string) {
    if (!confirm('Cancel this booking? Cancellations must be at least 24h before the session.')) return
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    if (userId) fetchBookings(userId)
  }

  const upcoming = bookings.filter(b => b.status === 'confirmed' && b.date >= new Date().toISOString().split('T')[0])
  const past = bookings.filter(b => b.status === 'cancelled' || b.date < new Date().toISOString().split('T')[0])

  return (
    <main className="page-wrapper">
      <Nav />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <p className="section-label">Your Space</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, color: 'var(--deep-brown)' }}>My <em>Bookings</em></h1>
          </div>
          <button onClick={() => router.push('/book')} className="btn-primary">Book a Session</button>
        </div>

        {loading ? <div className="loading">Loading...</div> : (
          <>
            {upcoming.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: 'var(--deep-brown)', marginBottom: '20px' }}>Upcoming Sessions</h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {upcoming.map(b => (
                    <div key={b.id} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>{b.locations?.name}</p>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, color: 'var(--deep-brown)', marginBottom: '4px' }}>{formatDate(b.date)}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-mid)' }}>{b.start_time} — 60 min · {b.locations?.address}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>Confirmed</span>
                        <button onClick={() => cancelBooking(b.id)} className="btn-danger">Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcoming.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--parchment)', borderRadius: '8px', marginBottom: '40px' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300, color: 'var(--text-mid)', marginBottom: '16px' }}>No upcoming sessions</p>
                <button onClick={() => router.push('/book')} className="btn-primary">Book Your First Session</button>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: 'var(--deep-brown)', marginBottom: '20px' }}>Past Sessions</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {past.map(b => (
                    <div key={b.id} className="card" style={{ opacity: 0.6, padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-mid)', marginBottom: '4px' }}>{b.locations?.name}</p>
                          <p style={{ fontSize: '14px', color: 'var(--text-mid)' }}>{formatDate(b.date)} · {b.start_time}</p>
                        </div>
                        <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: b.status === 'cancelled' ? '#8b2020' : 'var(--text-mid)' }}>{b.status === 'cancelled' ? 'Cancelled' : 'Completed'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
