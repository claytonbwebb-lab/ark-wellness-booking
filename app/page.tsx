import Nav from '@/components/Nav'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="page-wrapper">
      <Nav />
      {/* Hero */}
      <section style={{ padding: '120px 48px 100px', background: 'var(--deep-brown)', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '20px' }}>The Ark Wellness</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(42px, 5vw, 68px)', fontWeight: 300, color: 'var(--cream)', lineHeight: 1.1, marginBottom: '24px' }}>
          Regulate. Release. <em style={{ color: 'var(--gold)' }}>Reset.</em>
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(245,240,232,0.65)', maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.8 }}>
          Sound frequency therapy, quartz amplification and biometric validation. Nervous system regulation in as little as 60 minutes.
        </p>
        <Link href="/book" className="btn-primary" style={{ fontSize: '11px' }}>Book a Session</Link>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--parchment)', padding: '80px 48px', textAlign: 'center' }}>
        <p className="section-label">Evidence-Based Wellness</p>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Where Science Meets Soul</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', maxWidth: '580px', margin: '0 auto 48px', lineHeight: 1.8 }}>
          The Ark combines sound frequency therapy, quartz amplification and biometric validation to deliver profound nervous system regulation.
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

      {/* Sessions */}
      <section className="sessions-section" id="sessions">
        <div className="sessions-header">
          <p className="section-label">Sessions</p>
          <h2 className="section-title">Your Ark <em>Journey</em></h2>
          <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8 }}>
            Each session is a fully immersive experience, combining cutting-edge biometric measurement with our unique sound frequency therapy protocols.
          </p>
        </div>
        <div className="sessions-grid">
          {[
            { name: 'Deep Calm', duration: '60 min', price: 'From £60', features: ['Nervous system reset', 'Heart rate variability improvement', 'Biometric validation pre/post'], featured: false },
            { name: 'Better Sleep', duration: '60 min', price: 'From £60', features: ['Improved sleep quality', 'Cortisol regulation', 'Circadian rhythm reset'], featured: false },
            { name: 'Full Ark Experience', duration: '90 min', price: 'From £90', features: ['Complete nervous system overhaul', 'Quartz amplification', 'Full biometric workup', 'Personalised protocol'], featured: true },
          ].map(({ name, duration, price, features, featured }) => (
            <div key={name} className={`session-card${featured ? ' featured' : ''}`}>
              <p className="session-duration">{duration}</p>
              <h3 className="session-name">{name}</h3>
              <p className="session-price">{price}</p>
              <ul className="session-features">
                {features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <Link href="/book" className="btn-book">Book This Session</Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--deep-brown)', padding: '90px 48px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '22px', color: 'var(--gold)', marginBottom: '16px' }}>"Where Science Meets Soul"</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 300, color: 'var(--cream)', marginBottom: '32px' }}>Ready to Transform?</h2>
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
