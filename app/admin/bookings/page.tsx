'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Booking, Location } from '@/lib/types'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [filterLoc, setFilterLoc] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('locations').select('*').then(({ data }) => setLocations(data ?? []))
  }, [])

  useEffect(() => {
    setLoading(true)
    let q = supabase
      .from('bookings')
      .select('*, profiles(name, email, phone), locations(name)')
      .order('date', { ascending: false })
      .limit(100)

    if (filterLoc) q = q.eq('location_id', filterLoc)
    if (filterStatus !== 'all') q = q.eq('status', filterStatus)

    q.then(({ data }) => {
      let list = data ?? []
      if (search) {
        const s = search.toLowerCase()
        list = list.filter((b: Booking) =>
          b.profiles?.name?.toLowerCase().includes(s) || b.profiles?.email?.toLowerCase().includes(s)
        )
      }
      setBookings(list)
      setLoading(false)
    })
  }, [filterLoc, filterStatus, search])

  async function cancelBooking(id: string) {
    if (!confirm('Cancel this booking?')) return
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <p className="section-label">Admin</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: 'var(--deep-brown)' }}>All <em>Bookings</em></h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <input type="text" className="form-input" placeholder="Search client name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '280px' }} />
        <select className="form-input" value={filterLoc} onChange={e => setFilterLoc(e.target.value)} style={{ maxWidth: '220px' }}>
          <option value="">All Locations</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: '160px' }}>
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span style={{ fontSize: '12px', color: 'var(--text-mid)', alignSelf: 'center', marginLeft: 'auto' }}>{bookings.length} result{bookings.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? <div className="loading">Loading...</div> : bookings.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--parchment)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--text-mid)' }}>No bookings found</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--white)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--deep-brown)' }}>
                {['Date', 'Time', 'Client', 'Location', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(196,150,90,0.1)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{new Date(b.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{b.start_time}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-dark)' }}>{b.profiles?.name ?? '—'}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-mid)' }}>{b.profiles?.email ?? ''}</p>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{b.locations?.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: b.status === 'confirmed' ? 'var(--gold)' : '#8b2020' }}>{b.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {b.status === 'confirmed' && (
                      <button onClick={() => cancelBooking(b.id)} style={{ background: 'none', border: 'none', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8b2020', cursor: 'pointer' }}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
