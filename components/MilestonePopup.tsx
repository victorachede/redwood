'use client'

import { useEffect, useState } from 'react'
import type { Milestone, MilestoneKind } from '@/app/lib/milestones'
import { checkMilestones } from '@/app/lib/milestones'

const KIND: Record<MilestoneKind, { from: string; to: string; glow: string; label: string }> = {
  streak: { from: '#ffd27a', to: '#e08a2b', glow: 'var(--streak)', label: 'day streak' },
  questions: { from: '#7fb0ff', to: '#2b57a3', glow: 'var(--primary)', label: 'questions answered' },
  cards: { from: '#7fe6b8', to: '#1e9a63', glow: 'var(--correct)', label: 'cards saved' },
}

/** Fixed, tasteful positions — a scatter, not randomness re-rolled every render. */
const CONFETTI = [
  { x: '12%', y: '18%', size: 7, delay: 0, shape: 'circle' },
  { x: '85%', y: '14%', size: 5, delay: 80, shape: 'square' },
  { x: '20%', y: '78%', size: 6, delay: 160, shape: 'square' },
  { x: '90%', y: '70%', size: 8, delay: 40, shape: 'circle' },
  { x: '6%', y: '48%', size: 5, delay: 220, shape: 'circle' },
  { x: '94%', y: '44%', size: 6, delay: 120, shape: 'square' },
  { x: '30%', y: '8%', size: 5, delay: 260, shape: 'circle' },
  { x: '72%', y: '86%', size: 6, delay: 60, shape: 'square' },
] as const

const SHARE_URL = 'https://redwood-sand.vercel.app'

function shareText(m: Milestone) {
  return `${m.emoji} ${m.title} on EWIN — learning one idea at a time for WAEC, NECO and JAMB.`
}

/**
 * Reads any newly-crossed milestones and queues them, one at a time.
 * Call from any page after an action that could move streak, practice
 * volume or the card count — see app/lib/milestones.ts for what counts.
 */
export function useMilestoneCheck(trigger: unknown) {
  const [queue, setQueue] = useState<Milestone[]>([])

  useEffect(() => {
    setQueue((prev) => [...prev, ...checkMilestones()])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  return {
    current: queue[0] ?? null,
    dismiss: () => setQueue((q) => q.slice(1)),
  }
}

export function MilestonePopup({ milestone, onDismiss }: { milestone: Milestone; onDismiss: () => void }) {
  const [shared, setShared] = useState(false)
  const accent = KIND[milestone.kind]

  async function share() {
    const text = shareText(milestone)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'EWIN', text, url: SHARE_URL })
      } catch {
        /* cancelled — not an error */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(`${text} ${SHARE_URL}`)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      /* clipboard denied — the button just does nothing this once */
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={milestone.title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-5"
      onClick={onDismiss}
    >
      <div
        className="pop relative w-full max-w-sm overflow-hidden rounded-[28px] px-7 pb-7 pt-9 text-center shadow-[var(--shadow-lg)]"
        style={{ background: 'linear-gradient(180deg, #201d18 0%, #14120f 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            aria-hidden
            className="rise pointer-events-none absolute"
            style={{
              left: c.x,
              top: c.y,
              width: c.size,
              height: c.size,
              background: i % 2 === 0 ? accent.glow : '#fff',
              opacity: i % 2 === 0 ? 0.9 : 0.5,
              borderRadius: c.shape === 'circle' ? '50%' : '2px',
              animationDelay: `${c.delay}ms`,
              animationDuration: '700ms',
            }}
          />
        ))}

        {/* Badge: layered glow rings behind the emoji, not a flat blob. */}
        <div className="pop relative mx-auto flex h-[104px] w-[104px] items-center justify-center" style={{ animationDelay: '60ms' }}>
          <span
            aria-hidden
            className="absolute inset-[-22px] rounded-full blur-2xl"
            style={{ background: accent.glow, opacity: 0.45 }}
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 32% 28%, ${accent.from}, ${accent.to})`,
              boxShadow: `0 0 0 5px rgba(255,255,255,0.07), 0 18px 32px -10px ${accent.glow}`,
            }}
          />
          <span className="relative text-[46px] leading-none">{milestone.emoji}</span>
        </div>

        <p className="tnum relative mt-6 font-display text-[46px] leading-none text-on-dark">
          {milestone.value}
        </p>
        <p
          className="relative mt-1.5 text-[12px] font-bold uppercase tracking-[0.16em]"
          style={{ color: accent.glow }}
        >
          {accent.label}
        </p>

        <p className="relative mx-auto mt-4 max-w-[250px] text-[14px] leading-relaxed text-on-dark/70">
          {milestone.subtitle}
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className="press relative mt-7 w-full rounded-full bg-paper py-3.5 text-[15px] font-bold text-ink"
        >
          Nice!
        </button>
        <button
          type="button"
          onClick={share}
          className="press relative mt-3 text-[13px] font-semibold text-on-dark/65"
        >
          {shared ? 'Copied to clipboard' : 'Share the win'}
        </button>
      </div>
    </div>
  )
}
