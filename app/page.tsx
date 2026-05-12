import Nav from '@/components/Nav'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="page-wrapper">
      <Nav />
      {/* Hero */}
      <section style={{
        padding: '120px 48px 100px',
        background: 'var(--deep-brown)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'var(--gold)', marginBottom: '20px',
        }}>The Ark Wellness — Booking Portal</p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(42px, 5vw, 68px)',
          fontWeight: 300, color: 'var(--cream)', lineHeight: 1.1,
          marginBottom: '24px',
        }}>
          Regulate. Release. <em style={{ color: 'var(--gold)' }}>Reset.</em>
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(245,240,232,0.65)', maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.8 }}>
          Book your sound frequency therapy session at The Ark. 60-minute sessions available across four UK & Ireland locations.
        </p>
        <Link href="/book" className="btn-primary" style={{ fontSize: '11px' }}>
          Book a Session
        </Link>
      </section>

      {/* Science */}
      <section style={{ background: 'var(--parchment)', padding: '80px 48px', textAlign: 'center' }}>
        <p className="section-label">Evidence-Based Wellness</p>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Where Science Meets Soul</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', maxWidth: '580px', margin: '0 auto 48px', lineHeight: 1.8 }}>
          The Ark combines sound frequency therapy, quartz amplification and biometric validation to deliver profound nervous system regulation in as little as 60 minutes.
        </p>
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { stat: '800+', label: 'Sessions Delivered' },
            { stat: '90%', label: 'Report Improved Functionality' },
            { stat: '72hrs', label: 'Sleep Improvements Within' },
          ].map(({ stat, label }) => (
            <div key={label}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, color: 'var(--gold)' }}>{stat}</div>
              <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-mid)', marginTop: '6px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Locations */}
      <section style={{ padding: '90px 48px', background: 'var(--cream)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p className="section-label">Four Locations</p>
          <h2 className="section-title" style={{ marginBottom: '48px' }}>Find Your Nearest Ark</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '22px' }}>
            {[
              { name: 'Ashton-under-Lyne', region: 'Greater Manchester', desc: 'Our flagship northern hub, serving Greater Manchester and beyond.' },
              { name: 'Manchester City Centre', region: 'Greater Manchester', desc: 'City-centre accessibility for clients across the region.' },
              { name: 'Alderley Edge', region: 'Cheshire', desc: "A tranquil setting in the heart of Cheshire's countryside." },
              { name: 'County Kerry', region: 'Ireland', desc: 'A unique rural Ark experience in the southwest of Ireland.' },
            ].map(({ name, region, desc }) => (
              <Link href={`/book?location=${encodeURIComponent(name)}`} key={name} className="card" style={{ display: 'block' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', marginBottom: '14px' }} />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color: 'var(--deep-brown)', marginBottom: '6px' }}>{name}</h3>
                <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>{region}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.7 }}>{desc}</p>
                <div style={{ marginTop: '20px', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm-brown)' }}>Book →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--parchment)', padding: '90px 48px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <p className="section-label">Simple & Seamless</p>
          <h2 className="section-title" style={{ marginBottom: '52px' }}>How to Book</h2>
          {[
            { n: '01', title: 'Choose Your Location', desc: 'Select from one of our four Ark locations across the UK and Ireland.' },
            { n: '02', title: 'Pick a Date & Time', desc: 'See real-time availability and choose a 60-minute slot that suits you.' },
            { n: '03', title: 'Confirm Your Session', desc: 'Enter your details and receive an instant confirmation by email.' },
          ].map(({ n, title, desc }) => (
            <div key={n} style={{ display: 'flex', gap: '28px', textAlign: 'left', marginBottom: '32px', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: 'var(--gold)', lineHeight: 1, flexShrink: 0 }}>{n}</span>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color: 'var(--deep-brown)', marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            </div>
          ))}
          <Link href="/book" className="btn-primary" style={{ marginTop: '16px' }}>Reserve Your Session</Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--deep-brown)', padding: '90px 48px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '22px', color: 'var(--gold)', marginBottom: '16px' }}>"Where Science Meets Soul"</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 300, color: 'var(--cream)', marginBottom: '32px' }}>
          Ready to Transform?
        </h2>
        <Link href="/book" className="btn-primary">Book Your Session</Link>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--deep-brown)', borderTop: '1px solid rgba(196,150,90,0.1)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: 'var(--gold)' }}>The Ark Wellness</p>
        <p style={{ fontSize: '12px', color: 'rgba(245,240,232,0.35)' }}>© {new Date().getFullYear()} The Ark Wellness. All rights reserved.</p>
      </footer>
    </main>
  )
}
