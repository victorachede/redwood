'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Layers } from 'lucide-react'
import { FlipCard } from '@/components/FlipCard'
import {
  dueCards,
  gradeCard,
  listCards,
  hydrateCardsFromCloud,
  type StudyCard,
} from '@/app/lib/cards'
import { SiteHeader } from '@/components/SiteHeader'

export default function CardsPage() {
  const [queue, setQueue] = useState<StudyCard[]>([])
  const [allCount, setAllCount] = useState(0)
  const [done, setDone] = useState(0)
  const [revealed, setRevealed] = useState(false)

  function refresh() {
    const due = dueCards()
    setQueue(due)
    setAllCount(listCards().length)
    setRevealed(false)
  }

  useEffect(() => {
    refresh()
    void hydrateCardsFromCloud().then(() => refresh())
  }, [])

  const current = queue[0]

  function onGrade(g: 1 | 3 | 4 | 5) {
    if (!current) return
    gradeCard(current.id, g)
    setDone((d) => d + 1)
    setQueue((q) => q.slice(1))
    setRevealed(false)
  }

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />
      <div className="mx-auto max-w-lg px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-5 inline-flex items-center gap-1 text-[13px] text-ink-muted no-underline hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/12">
            <Layers className="h-5 w-5 text-gold-600" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
              Spaced repetition
            </p>
            <h1 className="font-serif text-[1.75rem] font-semibold tracking-[-0.025em]">
              Study cards
            </h1>
          </div>
        </div>
        <p className="mb-7 text-[14px] leading-relaxed text-ink-muted">
          Flip to check yourself. Rate how it felt — Ewin brings hard ones back sooner.
          {allCount > 0 && <span className="font-medium text-ink"> · {allCount} saved</span>}
        </p>

        {!current ? (
          <div className="rounded-2xl border border-line bg-white p-10 text-center shadow-[var(--shadow-sm)]">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-600 to-navy-800 shadow-[var(--shadow-navy)]">
              <Layers className="h-6 w-6 text-gold-400" />
            </span>
            <p className="font-serif text-xl font-semibold">
              {allCount === 0 ? 'No cards yet' : 'Caught up'}
            </p>
            <p className="mx-auto mt-2 max-w-xs text-[13.5px] leading-relaxed text-ink-muted">
              {allCount === 0
                ? 'When you learn with the tutor, Ewin can suggest cards. Or finish a practice miss and add one.'
                : `You reviewed ${done || 'your'} due cards. Come back later.`}
            </p>
            <Link
              href="/dashboard"
              className="sheen mt-6 inline-block rounded-xl bg-gradient-to-br from-[#16274d] to-[#0e1b3a] px-6 py-3 text-[14px] font-medium text-[var(--on-accent)] no-underline shadow-[var(--shadow-md)]"
            >
              Go learn
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex w-full max-w-sm items-center justify-between">
              <p className="tnum text-[12px] text-ink-muted">
                <span className="font-semibold text-ink">{queue.length}</span> due
              </p>
              <p className="text-[12px] text-ink-subtle">tap to flip</p>
            </div>
            <FlipCard
              key={current.id}
              front={current.front}
              back={current.back}
              subject={current.subject}
              onFlip={(f) => setRevealed(f)}
            />
            {revealed && (
              <div className="mt-5 grid w-full max-w-sm grid-cols-4 gap-2">
                {(
                  [
                    [1, 'Again', '#c4485f'],
                    [3, 'Hard', '#d4763b'],
                    [4, 'Good', '#0e1b3a'],
                    [5, 'Easy', '#2f9e5f'],
                  ] as const
                ).map(([g, label, tone]) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onGrade(g)}
                    className="rounded-xl border py-2.5 text-[12.5px] font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-100"
                    style={{
                      borderColor: `color-mix(in srgb, ${tone} 35%, transparent)`,
                      background: `color-mix(in srgb, ${tone} 9%, transparent)`,
                      color: tone,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {!revealed && (
              <p className="mt-4 text-[12px] text-ink-muted">Flip first, then rate</p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
