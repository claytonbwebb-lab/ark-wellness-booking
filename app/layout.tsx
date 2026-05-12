import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Ark Wellness — Sound Frequency Therapy',
  description: 'The Ark combines sound frequency therapy, quartz amplification and biometric validation to deliver profound nervous system regulation.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏛</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  )
}
