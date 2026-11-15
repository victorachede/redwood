'use client'

import Link from 'next/link'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AppHeader } from '@/components/ui/AppHeader'
import { FlipCard } from '@/components/FlipCard'
import { SubjectIcon } from '@/components/SubjectIcon'
import { Portrait } from '@/components/cast/Portrait'
import { LayersIcon, Plus, RefreshCw, Trash2, X } from '@/components/icons'
import { SUBJECTS, getSubject } from '@/app/lib/subjects'
import { getCharacter } from '@/app/lib/cast'
import {
  addCard,
  deleteCard,
  dueCards,
  gradeCard,
  hydrateCardsFromCloud,
  listCards,
  restoreCard,
  reviewedToday,
  subjectIdOf,
  type StudyCard,
} from '@/app/lib/cards'
import { dueLabel, previewLabel, type Grade } from '@/app/lib/cardSchedule'
import { onSync } from '@/app/lib/sync'

/**
 * Study cards: review what is due, and look after the whole deck.
 *
 * Baba Ayo keeps this page. He does the weekly recap elsewhere, and his line
 * is the point of the page: what you revise, you keep.
 *
 * Review is a proper session. "Again" sends a card to the back of the
 * sitting instead of losing it until tomorrow, every grade can be undone,
 * each button says when the card would come back, and on a keyboard Space
 * flips and 1 to 4 grade.
 */

const GRADES: { g: Grade; label: string; key: string; tone: string }[] = [
  { g: 1, label: 'Again', key: '1', tone: 'var(--wrong)' },
  { g: 3, label: 'Hard', key: '2', tone: 'var(--streak)' },
  { g: 4, label: 'Good', key: '3', tone: 'var(--primary)' },
  { g: 5, label: 'Easy', key: '4', tone: 'var(--correct)' },
]

const SOURCE: Record<NonNullable<StudyCard['source']>, string> = {
  tutor: 'From a lesson',
  practice: 'From practice',
  work: 'From marked work',
  manual: 'Added by you',
}

const BABA = getCharacter('ayo')

type Undo = { before: StudyCard; queue: string[]; done: number; again: number }

function deckOf(c: StudyCard) {
  return subjectIdOf(c.subject) ?? 'other'
}

export default function CardsPage() {
  const [cards, setCards] = useState<StudyCard[]>([])
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<'review' | 'all'>('review')
  const [deck, setDeck] = useState<string | null>(null)

  // The review sitting: card ids still to go, and how it is going.
  const [queue, setQueue] = useState<string[]>([])
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(0)
  const [again, setAgain] = useState(0)
  const [undo, setUndo] = useState<Undo | null>(null)
  const [today, setToday] = useState(0)
  // The clock, read when cards load rather than during render.
  const [now, setNow] = useState(0)

  const startSession = useCallback((forDeck: string | null) => {
    setQueue(dueCards().filter((c) => !forDeck || deckOf(c) === forDeck).map((c) => c.id))
    setFlipped(false)
    setDone(0)
    setAgain(0)
    setUndo(null)
  }, [])

  const reload = useCallback(() => {
    setCards(listCards())
    setToday(reviewedToday())
    setNow(Date.now())
  }, [])

  useEffect(() => {
    // Cards live in browser storage, which the server render cannot see.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload()
    startSession(null)
    setReady(true)
    void hydrateCardsFromCloud()
      .then(reload)
      .catch(() => {})
    return onSync(reload)
  }, [reload, startSession])

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])
  const current = queue.length ? byId.get(queue[0]) : undefined
  const totalDue = useMemo(() => cards.filter((c) => c.due <= now).length, [cards, now])

  const decks = useMemo(() => {
    const map = new Map<string, { key: string; total: number; due: number }>()
    for (const c of cards) {
      const key = deckOf(c)
      const d = map.get(key) ?? { key, total: 0, due: 0 }
      d.total += 1
      if (c.due <= now) d.due += 1
      map.set(key, d)
    }
    return [...map.values()].sort((a, b) => b.due - a.due || b.total - a.total)
  }, [cards, now])

  const nextDue = useMemo(() => {
    const later = cards.filter((c) => c.due > now).sort((a, b) => a.due - b.due)[0]
    return later?.due
  }, [cards, now])

  const grade = useCallback(
    (g: Grade) => {
      if (!current || !flipped) return
      const res = gradeCard(current.id, g)
      if (!res) return
      setUndo({ before: res.before, queue, done, again })
      const rest = queue.slice(1)
      // Again: back of this sitting, not lost until tomorrow.
      setQueue(g === 1 ? [...rest, current.id] : rest)
      if (g === 1) setAgain((a) => a + 1)
      else setDone((d) => d + 1)
      setFlipped(false)
      reload()
    },
    [current, flipped, queue, done, again, reload],
  )

  const undoLast = useCallback(() => {
    if (!undo) return
    restoreCard(undo.before)
    setQueue(undo.queue)
    setDone(undo.done)
    setAgain(undo.again)
    setFlipped(true)
    setUndo(null)
    reload()
  }, [undo, reload])

  // Keyboard: Space or Enter flips, 1 to 4 grade, U undoes.
  useEffect(() => {
    if (tab !== 'review') return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select')) return
      if ((e.key === ' ' || e.key === 'Enter') && current && !t.closest('button')) {
        e.preventDefault()
        setFlipped((f) => !f)
      }
      const g = GRADES.find((x) => x.key === e.key)
      if (g) grade(g.g)
      if (e.key.toLowerCase() === 'u') undoLast()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tab, current, grade, undoLast])

  function pickDeck(key: string | null) {
    setDeck(key)
    startSession(key)
  }

  const sessionTotal = done + queue.length
  const progress = sessionTotal ? (done / sessionTotal) * 100 : 0
  const subject = current ? getSubject(deckOf(current)) : undefined

  const babaLine = !cards.length
    ? 'Your cards will live here. Learn something with your teacher, then save the part worth keeping.'
    : current
      ? `${queue.length} ${queue.length === 1 ? 'card is' : 'cards are'} waiting. What you revise, you keep.`
      : done > 0
        ? `Ehen. ${done} reviewed${again ? `, ${again} you went over twice` : ''}. Now you are walking on your own legs.`
        : nextDue
          ? `Nothing is due. Your next card comes back ${dueLabel(nextDue, now)}.`
          : 'Nothing is due right now.'

  return (
    <main className="bg-paper text-ink">
      <AppHeader
        title="Study cards"
        subtitle={ready ? `${cards.length} saved · ${totalDue} due` : undefined}
        back="/dashboard"
      />

      <div className="mx-auto max-w-2xl px-4 py-5">
        {/* ── Baba Ayo, who keeps the cards ──────────────────────────────── */}
        <section className="dash-card flex items-center gap-3.5 p-3.5" aria-label="Baba Ayo">
          {BABA && <Portrait character={BABA} talking={false} className="dash-face dash-face-lg" />}
          <p className="min-w-0 flex-1 text-[13.5px] leading-snug text-ink-muted">
            <span className="font-semibold text-ink">Baba Ayo: </span>
            {ready ? babaLine : '…'}
          </p>
          {today > 0 && (
            <span className="shrink-0 text-right">
              <span className="tnum block font-display text-[20px] leading-none text-ink">{today}</span>
              <span className="block text-[10.5px] text-ink-faint">today</span>
            </span>
          )}
        </section>

        <div className="mt-5 inline-flex rounded-xl border border-line bg-surface p-1" role="tablist" aria-label="Cards">
          {(['review', 'all'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`min-h-[44px] rounded-lg px-4 py-2 text-[13px] font-semibold ${tab === t ? 'bg-primary text-on-primary' : 'text-ink-muted hover:text-ink'}`}
            >
              {t === 'review' ? 'Review' : `All cards${ready ? ` (${cards.length})` : ''}`}
            </button>
          ))}
        </div>

        {decks.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Subject">
            <DeckChip label="All subjects" count={tab === 'review' ? totalDue : cards.length} active={deck === null} onClick={() => pickDeck(null)} />
            {decks.map((d) => {
              const s = getSubject(d.key)
              return (
                <DeckChip
                  key={d.key}
                  label={s?.name ?? 'Other'}
                  count={tab === 'review' ? d.due : d.total}
                  active={deck === d.key}
                  onClick={() => pickDeck(deck === d.key ? null : d.key)}
                  icon={s ? <SubjectIcon icon={s.icon} accent={s.accent} size={20} /> : <LayersIcon size={14} className="text-ink-faint" />}
                />
              )
            })}
          </div>
        )}

        {!ready ? (
          <div className="mt-5 space-y-3">
            <div className="skeleton h-2 w-full rounded-full" />
            <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
          </div>
        ) : tab === 'review' ? (
          <section className="mt-5" aria-label="Review">
            {current ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                    <span className="block h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
                  </span>
                  <span className="tnum shrink-0 text-[12.5px] text-ink-muted">{queue.length} to go</span>
                </div>

                <FlipCard
                  key={`${current.id}-${done}-${again}`}
                  front={current.front}
                  back={current.back}
                  subject={subject?.name ?? current.subject}
                  accent={subject?.accent}
                  note={current.source ? SOURCE[current.source] : undefined}
                  flipped={flipped}
                  onFlip={setFlipped}
                />

                {flipped ? (
                  <div className="mt-6 grid grid-cols-4 gap-2" role="group" aria-label="How well did you know it?">
                    {GRADES.map(({ g, label, key, tone }) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => grade(g)}
                        className="press flex flex-col items-center rounded-xl border py-2.5"
                        style={{ borderColor: `color-mix(in srgb, ${tone} 40%, transparent)`, background: `color-mix(in srgb, ${tone} 9%, var(--surface))` }}
                        aria-label={`${label}, back ${previewLabel(current, g) === '10m' ? 'in 10 minutes' : `in ${previewLabel(current, g)}`}`}
                      >
                        <span className="text-[13.5px] font-semibold" style={{ color: tone }}>{label}</span>
                        <span className="tnum mt-0.5 text-[11px] text-ink-muted">{previewLabel(current, g)}</span>
                        <kbd className="mt-1 hidden text-[10px] text-ink-faint sm:block">{key}</kbd>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button type="button" onClick={() => setFlipped(true)} className="press mt-6 w-full rounded-xl bg-primary py-3.5 text-[14.5px] font-semibold text-on-primary">
                    Show answer
                  </button>
                )}

                <div className="mt-4 flex items-center justify-between text-[12px] text-ink-faint">
                  <span className="hidden sm:inline">Space to flip · 1 to 4 to grade · U to undo</span>
                  {undo && (
                    <button type="button" onClick={undoLast} className="ml-auto inline-flex items-center gap-1.5 font-semibold text-primary">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Undo last
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="dash-card p-7 text-center">
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                  <LayersIcon size={22} className="text-primary" />
                </span>
                <p className="font-display text-[20px] text-ink">{!cards.length ? 'No cards yet' : done > 0 ? 'Session done' : 'All caught up'}</p>
                <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-ink-muted">
                  {!cards.length
                    ? 'When your teacher spots a fact worth remembering in a lesson, you can save it here. You can also add your own.'
                    : nextDue
                      ? `The next card comes back ${dueLabel(nextDue, now)}. Reviewing a little every day beats a lot the night before.`
                      : 'Nothing else is scheduled.'}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {cards.length > 0 && (
                    <button type="button" onClick={() => setTab('all')} className="press rounded-full border border-line-strong bg-surface px-5 py-2.5 text-[13.5px] font-semibold text-ink">
                      Browse your cards
                    </button>
                  )}
                  <Link href="/learn/mathematics" className="press rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-on-primary no-underline">
                    Start a lesson
                  </Link>
                </div>
              </div>
            )}
            {undo && !current && (
              <p className="mt-3 text-center">
                <button type="button" onClick={undoLast} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Undo last grade
                </button>
              </p>
            )}
          </section>
        ) : (
          <AllCards cards={cards} deck={deck} now={now} onChange={reload} />
        )}
      </div>
    </main>
  )
}

function DeckChip({ label, count, active, onClick, icon }: { label: string; count: number; active: boolean; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`press inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border py-1.5 pl-2.5 pr-3.5 text-[13px] font-semibold ${active ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-surface text-ink-muted'}`}
    >
      {icon}
      {label}
      <span className={`tnum rounded-full px-1.5 text-[11px] ${active ? 'bg-primary text-on-primary' : 'bg-sunken text-ink-muted'}`}>{count}</span>
    </button>
  )
}

/** Every card, with search, add and delete. */
function AllCards({ cards, deck, now, onChange }: { cards: StudyCard[]; deck: string | null; now: number; onChange: () => void }) {
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [subjectId, setSubjectId] = useState(deck && deck !== 'other' ? deck : 'mathematics')
  const [confirm, setConfirm] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return cards
      .filter((c) => !deck || deckOf(c) === deck)
      .filter((c) => !needle || c.front.toLowerCase().includes(needle) || c.back.toLowerCase().includes(needle))
      .sort((a, b) => a.due - b.due)
  }, [cards, deck, q])

  function save(e: FormEvent) {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return
    addCard({ front, back, subject: getSubject(subjectId)?.name, source: 'manual' })
    setFront('')
    setBack('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onChange()
  }

  return (
    <section className="mt-5" aria-label="All cards">
      <div className="flex gap-2">
        <label className="flex flex-1 items-center rounded-xl border border-line bg-surface px-3">
          <span className="sr-only">Search cards</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your cards"
            className="w-full bg-transparent py-2.5 text-[14px] text-ink outline-none placeholder:text-ink-faint"
          />
        </label>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          aria-expanded={adding}
          className="press inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-[13.5px] font-semibold text-on-primary"
        >
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {adding ? 'Close' : 'Add a card'}
        </button>
      </div>

      {adding && (
        <form onSubmit={save} className="dash-card mt-3 space-y-3 p-4">
          <label className="block text-[12.5px] font-semibold text-ink-muted">
            Subject
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="mt-1 block w-full rounded-lg border border-line-strong bg-paper px-3 py-2.5 text-[14px] text-ink">
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-[12.5px] font-semibold text-ink-muted">
            Question
            <textarea value={front} onChange={(e) => setFront(e.target.value)} rows={2} required maxLength={300} placeholder="What happens to a term when it crosses the equals sign?" className="mt-1 block w-full resize-none rounded-lg border border-line-strong bg-paper px-3 py-2.5 text-[14px] text-ink" />
          </label>
          <label className="block text-[12.5px] font-semibold text-ink-muted">
            Answer
            <textarea value={back} onChange={(e) => setBack(e.target.value)} rows={2} required maxLength={300} placeholder="Its sign flips: + becomes −, and − becomes +." className="mt-1 block w-full resize-none rounded-lg border border-line-strong bg-paper px-3 py-2.5 text-[14px] text-ink" />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" className="press rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-on-primary">Save card</button>
            {saved && <span role="status" className="text-[12.5px] font-semibold text-correct">Saved. It&rsquo;s due for review now.</span>}
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <p className="mt-6 text-center text-[13.5px] text-ink-muted">{q ? 'No cards match that search.' : 'No cards in this subject yet.'}</p>
      ) : (
        <ul className="dash-card mt-3 divide-y divide-line overflow-hidden">
          {list.map((c) => {
            const s = getSubject(deckOf(c))
            return (
              <li key={c.id} className="flex gap-3 px-4 py-3.5">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s?.accent ?? 'var(--line-strong)' }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium leading-snug text-ink">{c.front}</p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-ink-muted">{c.back}</p>
                  <p className="mt-1.5 text-[11.5px] text-ink-faint">
                    {s?.name ?? c.subject ?? 'Other'} · {c.due <= now ? <span className="font-semibold text-primary">due now</span> : `back ${dueLabel(c.due, now)}`}
                    {c.source ? ` · ${SOURCE[c.source]}` : ''}
                  </p>
                </div>
                {confirm === c.id ? (
                  <span className="flex shrink-0 items-start gap-1">
                    <button type="button" onClick={() => { deleteCard(c.id); setConfirm(null); onChange() }} className="press rounded-lg bg-wrong px-2.5 py-1.5 text-[12px] font-semibold text-on-primary">Delete</button>
                    <button type="button" onClick={() => setConfirm(null)} className="press rounded-lg px-2 py-1.5 text-[12px] font-semibold text-ink-muted">Keep</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirm(c.id)} aria-label={`Delete card: ${c.front}`} className="press h-8 w-8 shrink-0 rounded-lg text-ink-faint hover:bg-sunken hover:text-wrong">
                    <Trash2 className="mx-auto h-4 w-4" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
