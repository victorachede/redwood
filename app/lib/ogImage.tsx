import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

/**
 * Shared by app/opengraph-image.tsx and app/twitter-image.tsx — both
 * platforms get the same card, generated once from one source of truth
 * instead of two hand-maintained copies drifting apart.
 *
 * Colours are the landing page's actual tokens (app/globals.css), copied
 * as literal hex — Satori renders standalone with no access to the site's
 * CSS custom properties, so `var(--ink)` etc. would just resolve to
 * nothing here.
 */
const paper = '#fbf8f2'
const ink = '#1a1714'
const inkMuted = '#5c5449'
const inkFaint = '#746c5f'
const primary = '#22457f'
const rule = '#c56b64'
const onDark = '#f7f3ea'

const fontsDir = join(process.cwd(), 'app', 'fonts-og')

export async function renderOgImage() {
  const [semibold, bold, extrabold] = await Promise.all([
    readFile(join(fontsDir, 'Sora-SemiBold.ttf')),
    readFile(join(fontsDir, 'Sora-Bold.ttf')),
    readFile(join(fontsDir, 'Sora-ExtraBold.ttf')),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: paper,
          fontFamily: 'Sora',
        }}
      >
        {/* Soft blue blob, echoing the hero's Blob — depth, not a flat card */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -160,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background:
              'radial-gradient(circle at 35% 35%, rgba(126,163,224,0.55), rgba(47,90,158,0.28) 55%, rgba(47,90,158,0) 72%)',
            display: 'flex',
          }}
        />

        {/* Exercise-book ruled margin, the mark's own motif, carried into the page edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 96,
            width: 2,
            background: rule,
            opacity: 0.35,
            display: 'flex',
          }}
        />

        {/* Wordmark */}
        <div style={{ position: 'absolute', top: 56, left: 96, display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width={40} height={40} viewBox="0 0 32 32" fill="none">
            <rect x="1" y="1" width="30" height="30" rx="7.5" fill="#ffffff" stroke={ink} strokeWidth="1.75" />
            <path d="M10.5 3.5V28.5" stroke={rule} strokeWidth="1.75" strokeLinecap="round" />
            <path
              d="M7 17.5 L13.5 23 L25 10"
              stroke={primary}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.04em', color: ink }}>EWIN</span>
        </div>

        {/* Headline block */}
        <div style={{ position: 'absolute', top: 168, left: 96, width: 620, display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: primary,
            }}
          >
            Free · WAEC · NECO · JAMB
          </span>
          <span
            style={{
              marginTop: 20,
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: ink,
            }}
          >
            You don&rsquo;t need more hours.
          </span>
          <span
            style={{
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: ink,
            }}
          >
            You need it to stick.
          </span>
          <span style={{ marginTop: 22, fontSize: 21, fontWeight: 600, color: inkFaint, lineHeight: 1.5 }}>
            Teaches one idea, then proves you got it.
          </span>
        </div>

        {/* Floating subject card, the landing page's own hero cast — not just text */}
        <div
          style={{
            position: 'absolute',
            top: 150,
            right: 90,
            width: 250,
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            borderRadius: 20,
            padding: '22px 24px',
            boxShadow: '0 24px 60px rgba(26,23,20,0.16)',
            transform: 'rotate(3deg)',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width={20} height={20} viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5L6 11.5L13 4" stroke={onDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ marginTop: 14, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: inkFaint }}>
            Mathematics
          </span>
          <span style={{ marginTop: 4, fontSize: 19, fontWeight: 700, color: ink }}>Algebraic processes</span>
          <span style={{ marginTop: 4, fontSize: 14, color: inkFaint }}>5 topics</span>
        </div>

        {/* Second card, smaller, tucked lower-right for depth */}
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            right: 150,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#ffffff',
            borderRadius: 16,
            padding: '14px 20px',
            boxShadow: '0 18px 40px rgba(26,23,20,0.14)',
            transform: 'rotate(-2deg)',
          }}
        >
          {['#3b6fd4', '#2f9e5f', '#c4485f'].map((c) => (
            <div key={c} style={{ width: 22, height: 22, borderRadius: 7, background: c, display: 'flex' }} />
          ))}
          <span style={{ marginLeft: 6, fontSize: 15, fontWeight: 700, color: ink }}>WAEC · NECO · JAMB</span>
        </div>

        {/* Footer line */}
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            left: 96,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 999, background: '#2f9e5f', display: 'flex' }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: inkMuted }}>Free forever — no card, ever.</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Sora', data: semibold, weight: 600, style: 'normal' },
        { name: 'Sora', data: bold, weight: 700, style: 'normal' },
        { name: 'Sora', data: extrabold, weight: 800, style: 'normal' },
      ],
    },
  )
}
