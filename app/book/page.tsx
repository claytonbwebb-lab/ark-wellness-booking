'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'
import type { Location, TimeSlot } from '@/lib/types'

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function toDateInputValue(d: Date) {
  return d.toISOString().split('T')[0]
}

function BookContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const today = new Date()

  useEffect(() => {
    supabase.from('locations').select('*').then(({ data }) => {
      setLocations(data ?? [])
      const loc = searchParams.get('location')
      if (loc) {
        const found = data?.find((l: Location) => l.name === decodeURIComponent(loc))
        if (found) { setSelectedLocation(found); setStep(2) }
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedLocation || !selectedDate) return
    setLoadingSlots(true)
    fetch(`/api/slots?location_id=${selectedLocation.id}&date=${selectedDate}`)
      .then(r => r.json())
      .then(data => { setSlots(data.slots ?? []); setLoadingSlots(false) })
  }, [selectedLocation, selectedDate])

  function generateCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (Date | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
    return days
  }

  const calDays = generateCalendarDays(today.getFullYear(), today.getMonth())
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  async function handleBooking() {
    if (!selectedLocation || !selectedDate || !selectedSlot) return
    setSubmitting(true); setError('')
    const { data: { session } } = await supabase.auth.getSession()
    const authHeader = session?.access_token ? `Bearer ${session.access_token}` : ''
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authHeader ? { authorization: authHeader } : {}) },
      body: JSON.stringify({ location_id: selectedLocation.id, date: selectedDate, start_time: selectedSlot, name, email, phone }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }
    setSuccess(true)
  }

  if (success) return (
    <main className="page-wrapper">
      <Nav />
      <section style={{ maxWidth: '560px', margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--deep-brown)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '24px', color: 'var(--cream)' }}>✓</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, color: 'var(--deep-brown)', marginBottom: '16px' }}>Session <em>Confirmed</em></h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', marginBottom: '32px', lineHeight: 1.7 }}>
          Your Ark experience is booked for {formatDate(new Date(`${selectedDate}T${selectedSlot}`))} at {selectedLocation?.name}. A confirmation has been sent to {email}.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '40px' }}>Please arrive 10 minutes before your session.</p>
        <button onClick={() => router.push('/dashboard')} className="btn-primary">View My Bookings</button>
      </section>
    </main>
  )

  return (
    <main className="page-wrapper">
      <Nav />
      <div style={{ background: 'var(--parchment)', borderBottom: '1px solid rgba(196,150,90,0.15)', padding: '20px 48px', display: 'flex', justifyContent: 'center', gap: '48px' }}>
        {['Location', 'Date & Time', 'Your Details'].map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: step > i + 1 ? '1' : step === i + 1 ? '1' : '0.35' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: `1px solid ${step > i + 1 ? 'var(--gold)' : step === i + 1 ? 'var(--gold)' : 'var(--text-mid)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step > i + 1 ? 'var(--gold)' : 'transparent',
              fontSize: '11px', color: step > i + 1 ? 'var(--deep-brown)' : 'var(--text-mid)',
            }}>{step > i + 1 ? '✓' : i + 1}</div>
            <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: step === i + 1 ? 'var(--deep-brown)' : 'var(--text-mid)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 24px' }}>
        {step === 1 && (
          <div>
            <p className="section-label">Step 1</p>
            <h1 className="section-title" style={{ marginBottom: '40px' }}>Choose Your <em>Location</em></h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
              {locations.map(loc => (
                <button key={loc.id} onClick={() => { setSelectedLocation(loc); setStep(2) }}
                  className="card"
                  style={{ textAlign: 'left', cursor: 'pointer', border: selectedLocation?.id === loc.id ? '2px solid var(--gold)' : '2px solid transparent', background: selectedLocation?.id === loc.id ? 'var(--cream-dark)' : 'var(--white)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', marginBottom: '12px' }} />
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, color: 'var(--deep-brown)', marginBottom: '6px' }}>{loc.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-mid)' }}>{loc.address}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="section-label">Step 2</p>
            <h1 className="section-title" style={{ marginBottom: '8px' }}>Pick a <em>Date & Time</em></h1>
            <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '40px' }}>at {selectedLocation?.name} — 60-minute sessions</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <p style={{ fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-mid)', marginBottom: '14px' }}>{today.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                  {weekdays.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-mid)', padding: '6px 0' }}>{d}</div>)}
                  {calDays.map((day, i) => {
                    if (!day) return <div key={i} />
                    const isPast = day < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                    const isToday = day.toDateString() === today.toDateString()
                    const isSelected = selectedDate === toDateInputValue(day)
                    return (
                      <button key={i} disabled={isPast} onClick={() => { setSelectedDate(toDateInputValue(day)); setSelectedSlot('') }}
                        style={{
                          padding: '8px 4px', textAlign: 'center', fontSize: '13px',
                          background: isSelected ? 'var(--deep-brown)' : isToday ? 'var(--parchment)' : 'transparent',
                          color: isSelected ? 'var(--cream)' : isPast ? 'rgba(107,93,79,0.3)' : 'var(--text-dark)',
                          border: isToday && !isSelected ? '1px solid var(--gold)' : '1px solid transparent',
                          cursor: isPast ? 'default' : 'pointer', borderRadius: '4px',
                        }}>
                        {day.getDate()}
                      </button>
                    )
                  })}
                </div>
                <button onClick={() => setStep(1)} style={{ marginTop: '16px', background: 'none', border: 'none', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-mid)', cursor: 'pointer' }}>← Change location</button>
              </div>

              <div>
                {selectedDate ? (
                  <>
                    <p style={{ fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-mid)', marginBottom: '14px' }}>{formatDate(new Date(`${selectedDate}T12:00`))}</p>
                    {loadingSlots ? <div className="loading">Loading slots...</div> : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {slots.length === 0 && <p style={{ gridColumn: '1/-1', fontSize: '13px', color: 'var(--text-mid)' }}>No slots available for this date.</p>}
                        {slots.map(slot => (
                          <button key={slot.time} disabled={!slot.available}
                            onClick={() => { setSelectedSlot(slot.time); setStep(3) }}
                            style={{
                              padding: '10px 8px', textAlign: 'center', fontSize: '13px',
                              background: selectedSlot === slot.time ? 'var(--deep-brown)' : slot.available ? 'var(--white)' : 'var(--cream-dark)',
                              color: selectedSlot === slot.time ? 'var(--cream)' : slot.available ? 'var(--text-dark)' : 'rgba(107,93,79,0.35)',
                              border: `1px solid ${selectedSlot === slot.time ? 'var(--deep-brown)' : slot.available ? 'rgba(123,91,58,0.2)' : 'transparent'}`,
                              cursor: slot.available ? 'pointer' : 'not-allowed', borderRadius: '4px',
                            }}>
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', background: 'var(--parchment)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>Select a date to see available times</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="section-label">Step 3</p>
            <h1 className="section-title" style={{ marginBottom: '32px' }}>Confirm Your <em>Session</em></h1>
            <div style={{ background: 'var(--parchment)', padding: '28px 32px', marginBottom: '36px', borderTop: '2px solid var(--gold)' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-mid)', marginBottom: '14px' }}>Booking Summary</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[{ label: 'Location', value: selectedLocation?.name }, { label: 'Date', value: formatDate(new Date(`${selectedDate}T12:00`)) }, { label: 'Time', value: `${selectedSlot} — 60 min` }, { label: 'Session', value: 'Ark Sound Frequency Therapy' }].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-mid)', marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontSize: '15px', color: 'var(--text-dark)' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div style={{ display: 'grid', gap: '16px', maxWidth: '480px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" placeholder="+44 ..." value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
                <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
                <button onClick={handleBooking} disabled={submitting || !name || !email} className="btn-primary" style={{ flex: 1 }}>{submitting ? 'Booking...' : 'Confirm Booking'}</button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-mid)', marginTop: '12px', lineHeight: 1.6 }}>Cancellations must be made at least 24 hours before your session.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-mid)' }}>Loading...</div>}>
      <BookContent />
    </Suspense>
  )
}
