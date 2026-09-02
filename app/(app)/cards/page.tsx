'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Layers } from 'lucide-react'
import { AppHeader } from '@/components/ui/AppHeader'
import { FlipCard } from '@/components/FlipCard'
import { dueCards, gradeCard, listCards, hydrateCardsFromCloud, type StudyCard } from '@/app/lib/cards'

const GRADES = [
  { g: 1 as const, label: 'Again', tone: 'var(--wrong)' },
  { g: 3 as const, label: 'Hard', tone: 'var(--streak)' },
  { g: 4 as const, label: 'Good', tone: 'var(--primary)' },
  { g: 5 as const, label: 'Easy', tone: 'var(--correct)' },
]

export default function CardsPage() {
  const [queue, setQueue] = useState<StudyCard[]>([])
  const [allCount, setAllCount] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const load = () => {
      setQueue(dueCards())
      setAllCount(listCards().length)
    }
    load()
    setReady(true)
    void hydrateCardsFromCloud?.().then(load).catch(() => {})
  }, [])

  const current = queue[0]

  function onGrade(g: 1 | 3 | 4 | 5) {
    if (!current) return
    gradeCard(current.id, g)
    setDone((d) => d + 1)
    setQueue((q) => q.slice(1))
    setRevealed(false)
  }

  const total = done + queue.length
  const progress = total ? (done / total) * 100 : 0

  return (
    <main className="bg-paper text-ink">
      <AppHeader
        title="Study cards"
        subtitle={ready ? `${allCount} saved` : undefined}
        back="/dashboard"
      />

      <div className="mx-auto max-w-lg px-4 py-5">
        {!ready ? (
          <div className="space-y-3">
            <div className="skeleton h-2 w-full rounded-full" />
            <div className="skeleton aspect-[4/5] w-full rounded-2xl" />
          </div>
        ) : !current ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
              <Layers className="h-6 w-6 text-primary" />
            </span>
            <p className="font-display text-[20px] text-ink">
              {allCount === 0 ? 'No cards yet' : 'All caught up'}
            </p>
            <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-ink-muted">
              {allCount === 0
                ? 'When Ewin spots a fact worth remembering during a lesson, it will offer to save it here.'
                : done > 0
                  ? `You reviewed ${done} ${done === 1 ? 'card' : 'cards'}. Come back tomorrow.`
                  : 'Nothing is due right now. Come back tomorrow.'}
            </p>
            <Link
              href={allCount === 0 ? '/learn/mathematics' : '/dashboard'}
              className="press mt-6 inline-block rounded-full bg-primary px-6 py-3 text-[14.5px] font-medium text-on-primary no-underline"
            >
              {allCount === 0 ? 'Start a lesson' : 'Back to Today'}
            </Link>
          </div>
        ) : (
          <>
            {/* Session progress */}
            <div className="mb-4 flex items-center gap-3">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                <span
                  className="block h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </span>
              <span className="tnum shrink-0 text-[12.5px] text-ink-muted">
                {queue.length} left
              </span>
            </div>

            <FlipCard
              key={current.id}
              front={current.front}
              back={current.back}
              subject={current.subject}
              onFlip={(f) => setRevealed(f)}
            />

            {revealed ? (
              <div className="mt-5 grid grid-cols-4 gap-2">
                {GRADES.map(({ g, label, tone }) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onGrade(g)}
                    className="press rounded-xl border py-3 text-[13px] font-semibold"
                    style={{
                      borderColor: `color-mix(in srgb, ${tone} 40%, transparent)`,
                      background: `color-mix(in srgb, ${tone} 10%, transparent)`,
                      color: tone,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-center text-[13.5px] text-ink-muted">
                Tap the card, then say how it went
              </p>
            )}
          </>
        )}
      </div>
    </main>
  )
}
