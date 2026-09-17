import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Sora } from 'next/font/google'
import './globals.css'
import { ServiceWorker } from '@/components/ServiceWorker'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

/**
 * Display face, site-wide.
 *
 * Started as the marketing page's own face, sharper and more confident than
 * Geist alone; the app shell used a serif pairing (Instrument Serif) instead
 * for a while, which meant the landing page and the signed-in app spoke in
 * two different voices. Sora now carries every headline and display moment
 * everywhere — Geist stays for body copy and UI text, where a display-
 * leaning grotesque would read too heavy at length.
 */
const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Ewin — learn one idea, then prove it', template: '%s · Ewin' },
  description:
    'An AI tutor that teaches one idea, then checks you got it. Built for Nigerian secondary students preparing for WAEC, NECO and JAMB.',
  applicationName: 'Ewin',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Ewin', statusBarStyle: 'default' },
  keywords: ['WAEC', 'JAMB', 'NECO', 'AI tutor', 'Nigeria', 'exam prep', 'Ewin'],
  authors: [{ name: 'Ewin Academy' }],
  metadataBase: new URL('https://redwood-sand.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Ewin',
    title: 'Ewin — learn one idea, then prove it',
    description: 'Free AI tutor for WAEC, NECO and JAMB.',
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fbf8f2',
}


/** Site-wide identity — every page is part of the same EducationalOrganization,
 *  so this lives in the root layout rather than being repeated per page. */
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Ewin',
  url: 'https://redwood-sand.vercel.app',
  logo: 'https://redwood-sand.vercel.app/icon-512.png',
  description:
    'An AI tutor that teaches one idea, then checks you got it. Built for Nigerian secondary students preparing for WAEC, NECO and JAMB.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable}`}
    >
      <body>
        {children}
        <ServiceWorker />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  )
}
