import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ewin — Your WAEC, NECO & JAMB Tutor',
  description: 'AI-powered tutor for Nigerian students. Learn, get tested, improve.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
