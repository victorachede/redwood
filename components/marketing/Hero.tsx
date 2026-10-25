'use client'

import Link from 'next/link'
import type { ComponentType } from 'react'
import { SUBJECTS, type SubjectId } from '@/app/lib/subjects'
import { useAuthCta } from '@/components/useAuthCta'
import { AtomIcon, BookIcon, FlaskIcon, LeafIcon, SigmaIcon, TrendIcon } from '@/components/icons'

/**
 * The landing hero.
 *
 * Built after Duolingo's front door, not copied from it: almost no chrome, art on one side, one short line and
 * two chunky buttons on the other, and a strip along the bottom naming what you can learn. The art is the six
 * subjects as pressable tiles in the colours the rest of the app already gives them, so there is no character
 * to draw and nothing that looks like a stock photo.
 *
 * The speech bubble is the product in one line: EWIN does not just mark you wrong, it tells you where.
 */

type IconProps = { size?: number; className?: string }
const ICON: Record<SubjectId, ComponentType<IconProps>> = {
  mathematics: SigmaIcon,
  physics: AtomIcon,
  chemistry: FlaskIcon,
  biology: LeafIcon,
  english: BookIcon,
  economics: TrendIcon,
}

/** Where each tile sits in the 520 x 460 stage, how big it is, and how it is tilted. */
const TILES: Array<{ id: SubjectId; size: number; x: number; y: number; rot: number; z: number; delay: number }> = [
  { id: 'mathematics', size: 170, x: 96, y: 120, rot: -5, z: 3, delay: 0 },
  { id: 'physics', size: 120, x: 290, y: 50, rot: 8, z: 2, delay: 0.6 },
  { id: 'chemistry', size: 112, x: 20, y: 290, rot: 7, z: 2, delay: 1.1 },
  { id: 'biology', size: 116, x: 300, y: 300, rot: -7, z: 2, delay: 0.3 },
  { id: 'english', size: 104, x: 20, y: 40, rot: -9, z: 1, delay: 0.9 },
  { id: 'economics', size: 96, x: 400, y: 196, rot: 6, z: 1, delay: 1.4 },
]

/** A darker version of a colour, for the lower edge that makes a tile look pressable. */
function darker(hex: string, amount = 0.28): string {
  const n = parseInt(hex.slice(1), 16)
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 - amount))))
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`
}

export function Hero() {
  const cta = useAuthCta('/signup')

  return (
    <section className="hx">
      <div className="hx-grid">
        <div className="hx-art" data-hero-cast aria-hidden>
          <div className="hx-stage">
            {TILES.map((t) => {
              const s = SUBJECTS.find((q) => q.id === t.id)
              if (!s) return null
              const Icon = ICON[t.id]
              return (
                <div
                  key={t.id}
                  className="hx-tile"
                  style={{
                    left: t.x,
                    top: t.y,
                    width: t.size,
                    height: t.size,
                    zIndex: t.z,
                    borderRadius: t.size * 0.28,
                    background: s.accent,
                    boxShadow: `0 ${Math.round(t.size * 0.07)}px 0 ${darker(s.accent)}`,
                    ['--tilt' as string]: `${t.rot}deg`,
                    animationDelay: `${t.delay}s`,
                  }}
                >
                  <Icon size={Math.round(t.size * 0.4)} className="text-white" />
                </div>
              )
            })}
            <p className="hx-bubble">Almost! Check your sign.</p>
          </div>
        </div>

        <div className="hx-copy">
          <h1 data-hero-item className="hx-title">
            The free, fun way to pass WAEC, NECO and JAMB.
          </h1>
          <div data-hero-item className="hx-actions">
            <Link href={cta.href} className="hx-btn hx-btn-primary press no-underline">
              {cta.signedIn ? 'Continue learning' : 'Get started'}
            </Link>
            {!cta.signedIn && (
              <Link href="/login" className="hx-btn hx-btn-ghost press no-underline">
                I already have an account
              </Link>
            )}
          </div>
          <p data-hero-item className="hx-note">
            Free forever. No card, ever.
          </p>
        </div>
      </div>

      <nav className="hx-strip" aria-label="Subjects">
        {SUBJECTS.map((s) => {
          const Icon = ICON[s.id]
          return (
            <Link key={s.id} href="/#subjects" className="hx-sub no-underline">
              <span className="hx-sub-dot" style={{ background: s.accent, boxShadow: `0 2px 0 ${darker(s.accent)}` }}>
                <Icon size={14} className="text-white" />
              </span>
              {s.name}
            </Link>
          )
        })}
      </nav>
    </section>
  )
}
