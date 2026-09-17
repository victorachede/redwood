'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AppHeader } from '@/components/ui/AppHeader'
import { FlipCard } from '@/components/FlipCard'
import { SubjectIcon } from '@/components/SubjectIcon'
import { LayersIcon } from '@/components/icons'
import { SUBJECTS, type Subject } from '@/app/lib/subjects'
import { dueCards, gradeCard, listCards, hydrateCardsFromCloud, type StudyCard } from '@/app/lib/cards'

const GRADES = [
  { g: 1 as const, label: 'Again', tone: 'var(--wrong)' },
  { g: 3 as const, label: 'Hard', tone: 'var(--streak)' },
  { g: 4 as const, label: 'Good', tone: 'var(--primary)' },
  { g: 5 as const, label: 'Easy', tone: 'var(--correct)' },
]

/**
 * Best-effort match: `StudyCard.subject` is a loose display label copied
 * from wherever the card was saved (a lesson's subject name, a work
 * item's title), not a stable subject id — there's nothing else to key a
 * deck off, so cards that don't match land in "Other" rather than being
 * silently dropped or mis-filed.
 */
function matchSubject(label?: string): Subject | undefined {
  if (!label) return undefined
  const norm = label.trim().toLowerCase()
  return SUBJECTS.find((s) => s.name.toLowerCase() === norm)
}

type Deck = { key: string; subject?: Subject; label: string; total: number; due: number }

function buildDecks(): Deck[] {
  const all = listCards()
  const dueIds = new Set(dueCards().map((c) => c.id))
  const map = new Map<string, Deck>()
  for (const c of all) {
    const subject = matchSubject(c.subject)
    const key = subject?.id ?? 'other'
    const label = subject?.name ?? c.subject ?? 'Other'
    const entry = map.get(key) ?? { key, subject, label, total: 0, due: 0 }
    entry.total += 1
    if (dueIds.has(c.id)) entry.due += 1
    map.set(key, entry)
  }
  return [...map.values()].sort((a, b) => b.due - a.due || b.total - a.total)
}

export default function CardsPage() {
  const [allCards, setAllCards] = useState<StudyCard[]>([])
  const [queue, setQueue] = useState<StudyCard[]>([])
  const [decks, setDecks] = useState<Deck[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(0)
  const [ready, setReady] = useState(false)

  function load() {
    setAllCards(listCards())
    setQueue(dueCards())
    setDecks(buildDecks())
  }

  useEffect(() => {
    load()
    setReady(true)
    void hydrateCardsFromCloud?.().then(load).catch(() => {})
  }, [])

  const filteredQueue = useMemo(
    () => (filter ? queue.filter((c) => (matchSubject(c.subject)?.id ?? 'other') === filter) : queue),
    [queue, filter],
  )

  const current = filteredQueue[0]
  const allCount = allCards.length
  const totalDue = queue.length

  function onGrade(g: 1 | 3 | 4 | 5) {
    if (!current) return
    gradeCard(current.id, g)
    setDone((d) => d + 1)
    setQueue((q) => q.filter((c) => c.id !== current.id))
    setDecks(buildDecks())
    setRevealed(false)
  }

  const total = done + filteredQueue.length
  const progress = total ? (done / total) * 100 : 0
  const activeDeck = filter ? decks.find((d) => d.key === filter) : undefined

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
        ) : allCount === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
              <LayersIcon size={22} className="text-primary" />
            </span>
            <p className="font-display text-[20px] text-ink">No cards yet</p>
            <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-ink-muted">
              When EWIN spots a fact worth remembering during a lesson, it will offer to save
              it here.
            </p>
            <Link
              href="/learn/mathematics"
              className="press mt-6 inline-block rounded-full bg-primary px-6 py-3 text-[14.5px] font-medium text-on-primary no-underline"
            >
              Start a lesson
            </Link>
          </div>
        ) : (
          <>
            {/* ── Decks by subject ─────────────────────────────────────── */}
            <h2 className="margin-label">By subject</h2>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {decks.map((d) => {
                const active = filter === d.key
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => {
                      setFilter(active ? null : d.key)
                      setRevealed(false)
                    }}
                    className="press rounded-2xl border p-3.5 text-left transition-colors"
                    style={{
                      borderColor: active ? (d.subject?.accent ?? 'var(--primary)') : 'var(--line)',
                      background: active
                        ? `color-mix(in srgb, ${d.subject?.accent ?? 'var(--primary)'} 8%, var(--surface))`
                        : 'var(--surface)',
                    }}
                  >
                    {d.subject ? (
                      <SubjectIcon icon={d.subject.icon} accent={d.subject.accent} size={32} />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sunken">
                        <LayersIcon size={15} className="text-ink-faint" />
                      </span>
                    )}
                    <p className="mt-2 truncate text-[13px] font-bold text-ink">{d.label}</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      {d.total} {d.total === 1 ? 'card' : 'cards'}
                    </p>
                    {d.due > 0 && (
                      <span
                        className="mt-2 inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                        style={{
                          background: `color-mix(in srgb, ${d.subject?.accent ?? 'var(--primary)'} 14%, transparent)`,
                          color: d.subject?.accent ?? 'var(--primary)',
                        }}
                      >
                        {d.due} due
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* ── Review flow ──────────────────────────────────────────── */}
            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="margin-label">
                  {activeDeck ? activeDeck.label : 'Due for review'}
                </h2>
                {filter && (
                  <button
                    type="button"
                    onClick={() => setFilter(null)}
                    className="text-[12.5px] font-semibold text-primary"
                  >
                    All subjects
                  </button>
                )}
              </div>

              {!current ? (
                <div className="rounded-2xl border border-line bg-surface p-8 text-center">
                  <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                    <LayersIcon size={22} className="text-primary" />
                  </span>
                  <p className="font-display text-[20px] text-ink">All caught up</p>
                  <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-ink-muted">
                    {done > 0
                      ? `You reviewed ${done} ${done === 1 ? 'card' : 'cards'}. Come back tomorrow.`
                      : filter
                        ? 'Nothing due in this deck right now.'
                        : 'Nothing is due right now. Come back tomorrow.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                      <span
                        className="block h-full rounded-full bg-primary transition-[width] duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </span>
                    <span className="tnum shrink-0 text-[12.5px] text-ink-muted">
                      {filteredQueue.length} left
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

            {totalDue === 0 && done === 0 && (
              <p className="mt-6 text-center text-[12.5px] text-ink-muted">
                Nothing due across any deck. Come back tomorrow.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  )
}
