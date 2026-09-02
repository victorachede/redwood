import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

/** Display face. Variable, so one file covers the whole weight range. */
const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
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
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Ewin' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-mark.png', sizes: '256x256', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf8f2' },
    { media: '(prefers-color-scheme: dark)', color: '#14120f' },
  ],
}

/**
 * Applies the saved theme before first paint. Without this the page renders
 * light and then snaps to dark, which is worse than having no toggle at all.
 */
const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem('ewin-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
