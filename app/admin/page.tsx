'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Booking, Location } from '@/lib/types'

const LOCATIONS: Location[] = [
  { id: '', name: 'Ashton-under-Lyne', address: 'Greater Manchester' },
  { id: '', name: 'Manchester City Centre', address: 'Greater Manchester' },
  { id: '', name: 'Alderley Edge', address: 'Cheshire' },
  { id: '', name: 'County Kerry', address: 'Ireland' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function AdminCalendarPage() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Booking | null>(null)

  useEffect(() => {
    supabase.from('locations').select('*').then(({ data }) => {
      setLocations(data ?? [])
      if (data && data.length > 0) {
        // Update location IDs dynamically
        const names = ['Ashton-under-Lyne', 'Manchester City Centre', 'Alderley Edge', 'County Kerry']
        names.forEach((name, i) => {
          const loc = data.find((l: Location) => l.name === name)
          if (loc && i < LOCATIONS.length) LOCATIONS[i].id = loc.id
        })
      }
    })
  }, [])

  useEffect(() => {
    if (!locations.length) return
    setLoading(true)
    const start = weekStart.toISOString().split('T')[0]
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    const endStr = end.toISOString().split('T')[0]

    supabase
      .from('bookings')
      .select('*, profiles(name, email, phone), locations(name)')
      .in('location_id', locations.map(l => l.id))
      .gte('date', start)
      .lte('date', endStr)
      .eq('status', 'confirmed')
      .then(({ data }) => {
        setBookings(data ?? [])
        setLoading(false)
      })
  }, [weekStart, locations])

  function prevWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }
  function nextWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }
  function thisWeek() {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    setWeekStart(d)
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  async function cancelBooking(id: string) {
    if (!confirm('Cancel this booking?')) return
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    setSelected(null)
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <p className="section-label">Admin</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: 'var(--deep-brown)' }}>Weekly <em>Calendar</em></h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={thisWeek} className="btn-secondary">Today</button>
          <button onClick={prevWeek} className="btn-secondary">← Prev</button>
          <button onClick={nextWeek} className="btn-secondary">Next →</button>
        </div>
      </div>

      <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '20px' }}>
        Week of {weekDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      {loading ? <div className="loading">Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(7, 1fr)`, gap: '1px', background: 'rgba(196,150,90,0.15)', border: '1px solid rgba(196,150,90,0.15)' }}>
          {/* Header row */}
          <div style={{ background: 'var(--deep-brown)' }} />
          {weekDays.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString()
            return (
              <div key={i} style={{ background: isToday ? 'rgba(196,150,90,0.15)' : 'var(--deep-brown)', padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)' }}>{DAYS[day.getDay()]}</div>
                <div style={{ fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", color: isToday ? 'var(--gold)' : 'var(--cream)', marginTop: '2px' }}>{day.getDate()}</div>
              </div>
            )
          })}

          {/* Location rows */}
          {LOCATIONS.map(loc => (
            <>
              {/* Location label */}
              <div key={`loc-${loc.id}`} style={{ background: 'var(--parchment)', padding: '12px 8px', display: 'flex', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 400, color: 'var(--deep-brown)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{loc.name}</p>
                </div>
              </div>
              {/* Day cells */}
              {weekDays.map((day, di) => {
                const dateStr = day.toISOString().split('T')[0]
                const dayBookings = bookings.filter(b => b.location_id === loc.id && b.date === dateStr)
                return (
                  <div key={di} style={{ background: 'var(--white)', minHeight: '120px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayBookings.map(b => (
                      <button key={b.id} onClick={() => setSelected(b)}
                        style={{
                          padding: '6px 8px', textAlign: 'left', background: 'var(--deep-brown)', border: 'none', borderRadius: '4px',
                          cursor: 'pointer', borderLeft: `3px solid var(--gold)`,
                        }}>
                        <p style={{ fontSize: '11px', color: 'var(--cream)', fontWeight: 400 }}>{b.start_time}</p>
                        <p style={{ fontSize: '10px', color: 'var(--gold)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.profiles?.name ?? 'Client'}</p>
                      </button>
                    ))}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      )}

      {/* Booking detail popover */}
      {selected && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(43,31,20,0.4)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => setSelected(null)}>
          <div style={{ background: 'var(--white)', padding: '36px', maxWidth: '440px', width: '90%', borderTop: '3px solid var(--gold)' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: 'var(--deep-brown)', marginBottom: '20px' }}>
              {selected.profiles?.name}
            </h3>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
              {[
                { label: 'Email', value: selected.profiles?.email },
                { label: 'Phone', value: selected.profiles?.phone },
                { label: 'Location', value: selected.locations?.name },
                { label: 'Date', value: new Date(selected.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Time', value: selected.start_time },
                { label: 'Status', value: selected.status },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(196,150,90,0.1)', paddingBottom: '8px' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-mid)', width: '70px', flexShrink: 0 }}>{label}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-dark)' }}>{value ?? '—'}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
              {selected.status === 'confirmed' && (
                <button onClick={() => cancelBooking(selected.id)} className="btn-danger">Cancel Booking</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
