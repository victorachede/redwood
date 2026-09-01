import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Ewin — AI tutor for WAEC, NECO & JAMB',
    template: '%s · Ewin',
  },
  description:
    'An AI tutor that teaches one concept, then checks you understood — built for Nigerian secondary students preparing for WAEC, NECO and JAMB.',
  applicationName: 'Ewin',
  keywords: [
    'WAEC',
    'JAMB',
    'NECO',
    'AI tutor',
    'Nigeria',
    'secondary school',
    'exam prep',
    'Ewin',
  ],
  authors: [{ name: 'Ewin Academy' }],
  creator: 'Ewin Academy',
  metadataBase: new URL('https://ewin.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Ewin',
    title: 'Ewin — AI tutor for WAEC, NECO & JAMB',
    description:
      'Learn one idea. Then prove you got it. Free AI tutor built for Nigerian secondary students.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Ewin — AI tutor for WAEC, NECO & JAMB',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ewin — AI tutor for WAEC, NECO & JAMB',
    description:
      'Learn one idea. Then prove you got it. Free AI tutor for Nigerian secondary students.',
    images: ['/og.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-mark.png', sizes: '256x256', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a1428',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable}`}
    >
      <head>
        {/* Scroll-reveal is JS-driven. Without this, a no-JS visitor would see
            every revealed section stranded at opacity 0. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;animation:none!important}`}</style>
        </noscript>
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
