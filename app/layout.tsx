import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ewin — AI tutor for WAEC & JAMB',
  description:
    'Learn Mathematics, Physics, Chemistry, Biology, English and Economics with an AI tutor that teaches, then checks you understand — built for Nigerian secondary students.',
  openGraph: {
    title: 'Ewin — AI tutor for WAEC & JAMB',
    description: 'Concept by concept. Question by question. Free.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#070b09',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
