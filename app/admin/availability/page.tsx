'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Location, Availability } from '@/lib/types'

const DAYS = [
  { id: 0, label: 'Sunday' },
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
]

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 07:00–20:00

export default function AdminAvailabilityPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null)
  const [avail, setAvail] = useState<Record<number, { on: boolean; start: number; end: number }>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('locations').select('*').then(({ data }) => {
      setLocations(data ?? [])
      if (data?.length) setSelectedLoc(data[0])
    })
  }, [])

  useEffect(() => {
    if (!selectedLoc) return
    supabase
      .from('availability')
      .select('*')
      .eq('location_id', selectedLoc.id)
      .then(({ data }) => {
        const map: Record<number, { on: boolean; start: number; end: number }> = {}
        DAYS.forEach(d => {
          const found = data?.find((a: Availability) => a.day_of_week === d.id)
          map[d.id] = found
            ? { on: true, start: found.start_hour, end: found.end_hour }
            : { on: false, start: 9, end: 17 }
        })
        setAvail(map)
      })
  }, [selectedLoc])

  function toggleDay(day: number) {
    setAvail(prev => ({ ...prev, [day]: { ...prev[day], on: !prev[day].on } }))
  }

  async function handleSave() {
    if (!selectedLoc) return
    setSaving(true); setSaved(false)

    // Delete existing, then re-insert
    await supabase.from('availability').delete().eq('location_id', selectedLoc.id)
    const toInsert = DAYS
      .filter(d => avail[d.id]?.on)
      .map(d => ({
        location_id: selectedLoc.id,
        day_of_week: d.id,
        start_hour: avail[d.id].start,
        end_hour: avail[d.id].end,
      }))

    if (toInsert.length > 0) {
      await supabase.from('availability').insert(toInsert)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <p className="section-label">Admin</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: 'var(--deep-brown)' }}>Availability <em>Manager</em></h1>
      </div>

      {/* Location selector */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {locations.map(loc => (
          <button key={loc.id} onClick={() => setSelectedLoc(loc)}
            style={{
              padding: '10px 20px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
              background: selectedLoc?.id === loc.id ? 'var(--deep-brown)' : 'var(--white)',
              color: selectedLoc?.id === loc.id ? 'var(--cream)' : 'var(--text-mid)',
              border: `1px solid ${selectedLoc?.id === loc.id ? 'var(--deep-brown)' : 'rgba(123,91,58,0.2)'}`,
              cursor: 'pointer',
            }}>
            {loc.name}
          </button>
        ))}
      </div>

      {selectedLoc && (
        <div style={{ maxWidth: '700px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '24px' }}>
            Set the weekly schedule for <strong style={{ color: 'var(--deep-brown)' }}>{selectedLoc.name}</strong>. Green days are open for bookings.
          </p>

          <div style={{ background: 'var(--white)', borderTop: '2px solid var(--deep-brown)' }}>
            {DAYS.map((day, i) => {
              const a = avail[day.id] ?? { on: false, start: 9, end: 17 }
              return (
                <div key={day.id} style={{
                  display: 'grid', gridTemplateColumns: '140px 1fr auto',
                  gap: '16px', alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: i < 6 ? '1px solid rgba(196,150,90,0.1)' : 'none',
                  background: a.on ? 'rgba(43,31,20,0.03)' : 'transparent',
                }}>
                  {/* Day label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => toggleDay(day.id)}
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px',
                        background: a.on ? 'var(--deep-brown)' : 'rgba(107,93,79,0.2)',
                        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                        flexShrink: 0,
                      }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: 'var(--cream)',
                        position: 'absolute', top: '3px',
                        left: a.on ? '23px' : '3px',
                        transition: 'left 0.2s',
                      }} />
                    </button>
                    <span style={{ fontSize: '13px', color: 'var(--text-dark)', fontWeight: a.on ? 400 : 300 }}>{day.label}</span>
                  </div>

                  {/* Time range */}
                  {a.on ? (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <select className="form-input" value={a.start} onChange={e => setAvail(prev => ({ ...prev, [day.id]: { ...prev[day.id], start: Number(e.target.value) } }))} style={{ width: '100px' }}>
                        {HOURS.map(h => <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>)}
                      </select>
                      <span style={{ color: 'var(--text-mid)', fontSize: '13px' }}>to</span>
                      <select className="form-input" value={a.end} onChange={e => setAvail(prev => ({ ...prev, [day.id]: { ...prev[day.id], end: Number(e.target.value) } }))} style={{ width: '100px' }}>
                        {HOURS.filter(h => h > a.start).map(h => <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>)}
                      </select>
                      <span style={{ fontSize: '12px', color: 'var(--gold)' }}>
                        ({a.end - a.start}h)
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'rgba(107,93,79,0.4)', fontStyle: 'italic' }}>Closed</span>
                  )}

                  {/* Hours display */}
                  <span style={{ fontSize: '12px', color: 'var(--text-mid)', textAlign: 'right' }}>
                    {a.on ? `${String(a.start).padStart(2, '0')}:00 – ${String(a.end).padStart(2, '0')}:00` : '—'}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
            {saved && (
              <span style={{ fontSize: '13px', color: 'var(--gold)', alignSelf: 'center' }}>✓ Saved</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
