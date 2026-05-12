import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { location_id, date, start_time, name, email, phone } = await req.json()

    if (!location_id || !date || !start_time || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization')
    const isAuthenticated = !!authHeader

    // ── Look up or create user ──────────────────────────────────────────
    let userId: string | null = null

    if (isAuthenticated) {
      try {
        const sb = getServiceSupabase()
        const { data: { user } } = await sb.auth.getUser(authHeader.replace('Bearer ', ''))
        userId = user?.id ?? null
      } catch { userId = null }
    }

    if (!userId) {
      const sb = getServiceSupabase()
      // Look for existing profile by email
      const { data: existing } = await sb
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()

      if (existing) {
        userId = existing.id
      } else {
        // Auto-create a profile for guest booking (temp random password)
        const { data: { user }, error: signUpError } = await sb.auth.admin.createUser({
          email: email.toLowerCase(),
          password: Math.random().toString(36).slice(-8),
          email_confirm: true,
          user_metadata: { name, phone },
        })
        if (signUpError || !user) {
          return NextResponse.json({ error: 'Could not create account' }, { status: 500 })
        }
        userId = user.id
      }
    }

    // ── Calculate end time ─────────────────────────────────────────────
    const [h, m] = start_time.split(':').map(Number)
    const endDate = new Date(2000, 0, 1, h, m + 60)
    const end_time = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`

    // ── Check for double-booking ─────────────────────────────────────────
    const sb = getServiceSupabase()

    const { data: conflict } = await sb
      .from('bookings')
      .select('id')
      .eq('location_id', location_id)
      .eq('date', date)
      .eq('start_time', start_time)
      .eq('status', 'confirmed')
      .single()

    if (conflict) {
      return NextResponse.json({ error: 'This slot is already booked. Please choose another time.' }, { status: 409 })
    }

    // ── Get location details ─────────────────────────────────────────────
    const { data: location } = await sb
      .from('locations')
      .select('name, address')
      .eq('id', location_id)
      .single()

    // ── Create booking ────────────────────────────────────────────────────
    const { data: booking, error: insertError } = await sb
      .from('bookings')
      .insert({
        user_id: userId,
        location_id,
        date,
        start_time,
        end_time,
        status: 'confirmed',
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'This slot is already booked.' }, { status: 409 })
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // ── Send confirmation email ──────────────────────────────────────────
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const sessionDate = new Date(`${date}T${start_time}:00`)
    const formattedDate = sessionDate.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    await transporter.sendMail({
      from: `"The Ark Wellness" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Ark Session is Confirmed',
      html: `
        <div style="font-family:'Jost',sans-serif;max-width:560px;margin:0 auto;padding:40px 32px;background:#f5f0e8;">
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:300;color:#2b1f14;margin-bottom:8px;">Your session is confirmed</h1>
          <p style="font-family:'Cormorant Garamond',serif;font-style:italic;color:#c49a5a;font-size:18px;margin-bottom:32px;">Where Science Meets Soul</p>
          <hr style="border:none;border-top:1px solid rgba(196,150,90,0.3);margin-bottom:32px;"/>
          <h2 style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:400;color:#2b1f14;margin-bottom:24px;">${location?.name ?? ''}</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;font-size:12px;color:#6b5d4f;text-transform:uppercase;letter-spacing:0.15em;">Date</td>
                <td style="padding:8px 0;font-size:15px;color:#1a1209;">${formattedDate}</td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:#6b5d4f;text-transform:uppercase;letter-spacing:0.15em;">Time</td>
                <td style="padding:8px 0;font-size:15px;color:#1a1209;">${start_time}</td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:#6b5d4f;text-transform:uppercase;letter-spacing:0.15em;">Location</td>
                <td style="padding:8px 0;font-size:15px;color:#1a1209;">${location?.address ?? ''}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid rgba(196,150,90,0.3);margin:24px 0;"/>
          <p style="font-size:13px;color:#6b5d4f;line-height:1.7;">Please arrive 10 minutes before your session. Cancellations must be made at least 24 hours in advance.</p>
        </div>
      `,
    })

    return NextResponse.json({ booking })
  } catch (err) {
    console.error('Booking error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
