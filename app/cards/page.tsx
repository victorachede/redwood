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

        <div className="mb-6 flex items-center gap-2">
          <Layers className="h-5 w-5 text-accent" />
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Study cards</h1>
        </div>
        <p className="mb-6 text-[14px] text-ink-muted">
          Flip to check yourself. Rate how it felt — Ewin brings hard ones back sooner.
          {allCount > 0 && (
            <span className="text-ink"> · {allCount} saved</span>
          )}
        </p>

        {!current ? (
          <div className="rounded-2xl border border-line bg-[var(--paper-elevated)] p-8 text-center">
            <p className="font-serif text-xl font-semibold">
              {allCount === 0 ? 'No cards yet' : 'Caught up'}
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              {allCount === 0
                ? 'When you learn with the tutor, Ewin can suggest cards. Or finish a practice miss and add one.'
                : `You reviewed ${done || 'your'} due cards. Come back later.`}
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-[var(--on-accent)] no-underline"
            >
              Go learn
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="mb-3 text-[12px] text-ink-muted">
              {queue.length} due · tap the card to flip
            </p>
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
                    [1, 'Again'],
                    [3, 'Hard'],
                    [4, 'Good'],
                    [5, 'Easy'],
                  ] as const
                ).map(([g, label]) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onGrade(g)}
                    className={`rounded-full py-2.5 text-[12px] font-medium ${
                      g === 4
                        ? 'bg-accent text-[var(--on-accent)]'
                        : 'border border-line bg-[var(--paper-elevated)] text-ink hover:border-accent'
                    }`}
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
