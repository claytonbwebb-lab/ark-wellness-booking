import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const location_id = searchParams.get('location_id')
  const date = searchParams.get('date')

  if (!location_id || !date) {
    return NextResponse.json({ error: 'location_id and date are required' }, { status: 400 })
  }

  const dayOfWeek = new Date(date + 'T12:00:00').getDay()
  const sb = getServiceSupabase()

  // Get location availability for this day
  const { data: avail } = await sb
    .from('availability')
    .select('start_hour, end_hour')
    .eq('location_id', location_id)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!avail) {
    return NextResponse.json({ slots: [] })
  }

  // Generate hourly slots
  const slots: { time: string; available: boolean }[] = []
  for (let h = avail.start_hour; h < avail.end_hour; h++) {
    const time = `${String(h).padStart(2, '0')}:00`
    slots.push({ time, available: true })
  }

  // Mark already-booked slots
  const { data: bookings } = await sb
    .from('bookings')
    .select('start_time')
    .eq('location_id', location_id)
    .eq('date', date)
    .eq('status', 'confirmed')

  const bookedTimes = new Set((bookings ?? []).map((b: { start_time: string }) => b.start_time.slice(0, 5)))
  slots.forEach(slot => {
    if (bookedTimes.has(slot.time)) slot.available = false
  })

  // Remove past slots if booking today
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  if (date === todayStr) {
    const currentHour = now.getHours()
    slots.forEach(slot => {
      const [sh] = slot.time.split(':').map(Number)
      if (sh <= currentHour) slot.available = false
    })
  }

  return NextResponse.json({ slots })
}
