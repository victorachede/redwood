'use client'

import { useEffect, useState } from 'react'
import { Blob } from '@/components/Blob'
import type { Milestone, MilestoneKind } from '@/app/lib/milestones'
import { checkMilestones } from '@/app/lib/milestones'

const KIND_ACCENT: Record<MilestoneKind, { from: string; to: string; glow: string }> = {
  streak: { from: '#f2b25c', to: 'var(--streak)', glow: 'var(--streak)' },
  questions: { from: '#3a67a8', to: 'var(--primary)', glow: 'var(--primary)' },
  cards: { from: '#4fbd85', to: 'var(--correct)', glow: 'var(--correct)' },
}

const SHARE_URL = 'https://redwood-sand.vercel.app'

function shareText(m: Milestone) {
  return `${m.emoji} ${m.title} on Ewin — learning one idea at a time for WAEC, NECO and JAMB.`
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
  const accent = KIND_ACCENT[milestone.kind]

  async function share() {
    const text = shareText(milestone)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Ewin', text, url: SHARE_URL })
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-5"
      onClick={onDismiss}
    >
      <div
        className="pop relative w-full max-w-sm overflow-hidden rounded-3xl p-7 text-center text-on-dark shadow-[var(--shadow-lg)]"
        style={{ background: 'var(--ink)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Blob
          id={`milestone-blob-${milestone.id}`}
          from={accent.from}
          to={accent.to}
          className="pointer-events-none absolute -top-20 left-1/2 h-[260px] w-[260px] -translate-x-1/2 opacity-70"
        />

        <div className="relative">
          <span className="text-[56px] leading-none">{milestone.emoji}</span>
          <p className="mt-4 font-display text-[26px] leading-tight">{milestone.title}</p>
          <p className="mx-auto mt-2.5 max-w-[260px] text-[14px] leading-relaxed text-on-dark/70">
            {milestone.subtitle}
          </p>

          <div className="mt-7 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={share}
              className="press rounded-full px-5 py-3 text-[14.5px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.12)', color: 'var(--on-dark)' }}
            >
              {shared ? 'Copied!' : 'Share'}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="press rounded-full bg-paper px-5 py-3 text-[14.5px] font-semibold text-ink"
            >
              Nice!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
