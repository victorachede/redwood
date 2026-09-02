'use client'

import Link from 'next/link'
import { use, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, Clock, X } from 'lucide-react'
import { getSubject } from '@/app/lib/subjects'
import {
  questionsForExam,
  countByExam,
  secondsPerQuestion,
  type PastQuestion,
  type ExamBoard,
} from '@/app/lib/questions'
import { savePractice, saveMisses } from '@/app/lib/progress'
import { ExamBadge } from '@/components/ExamBadges'
import { SubjectIcon } from '@/components/SubjectIcon'
import { canAccessTimedMocks, isPro } from '@/app/lib/billing'

type Phase = 'idle' | 'active' | 'done'

export default function PracticePage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const meta = getSubject(subject)
  const subjectLabel = meta?.name ?? subject
  const accent = meta?.accent ?? '#0e1b3a'

  const [exam, setExam] = useState<ExamBoard>('ALL')
  const [timed, setTimed] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const bank = useMemo(() => questionsForExam(subject, exam), [subject, exam])
  const counts = useMemo(() => countByExam(subject), [subject])

  const [phase, setPhase] = useState<Phase>('idle')
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [misses, setMisses] = useState<PastQuestion[]>([])

  const q: PastQuestion | undefined = bank[index]
  const total = bank.length
  const perQ = secondsPerQuestion(exam)

  useEffect(() => {
    if (phase !== 'active' || !timed || revealed) return
    if (secondsLeft <= 0) {
      // auto-miss on timeout
      if (q && !revealed) {
        setRevealed(true)
        setMisses((m) => [...m, q])
      }
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timed, secondsLeft, revealed, q])

  /** Records which questions were actually missed, so the tutor can reteach
   *  them later. Aggregates alone could never support that. */
  function persistMisses(list: PastQuestion[]) {
    saveMisses(
      list.map((m) => ({
        subjectId: subject,
        questionId: m.id,
        question: m.question,
        picked: m.options[m.answer] ? m.answer : '',
        correct: m.answer,
        topic: m.topic,
      })),
    )
  }

  function start() {
    if (!bank.length) return
    setPhase('active')
    setIndex(0)
    setPicked(null)
    setCorrectCount(0)
    setRevealed(false)
    setMisses([])
    if (timed) setSecondsLeft(perQ)
  }

  function choose(opt: string) {
    if (revealed || !q) return
    setPicked(opt)
    setRevealed(true)
    if (opt === q.answer) setCorrectCount((c) => c + 1)
    else setMisses((m) => [...m, q])
  }

  function next() {
    if (!q) return
    if (index + 1 >= total) {
      savePractice({
        subjectId: subject,
        correct: correctCount,
        total,
        at: Date.now(),
      })
      persistMisses(misses)
      setPhase('done')
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
    setRevealed(false)
    if (timed) setSecondsLeft(perQ)
  }

  function finishEarly() {
    const attempted = index + (revealed ? 1 : 0)
    savePractice({
      subjectId: subject,
      correct: correctCount,
      total: Math.max(attempted, 1),
      at: Date.now(),
    })
    persistMisses(misses)
    setPhase('done')
  }

  if (!counts.ALL) {
    return (
      <main className="min-h-dvh bg-paper px-4 py-16 text-center text-ink">
        <p className="text-sm text-ink-muted">No practice questions for this subject yet.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-primary">
          ← Dashboard
        </Link>
      </main>
    )
  }

  if (phase === 'idle') {
    return (
      <main className="min-h-dvh bg-paper text-ink">
        <header className="border-b border-line bg-paper/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
            <Link
              href="/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-[14px] font-semibold leading-tight">{subjectLabel} practice</p>
              <p className="text-[11px] leading-tight text-ink-muted">
                Past-style questions · pick an exam board
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-10">
          
            <div className="flex items-center gap-3.5">
              {meta && <SubjectIcon icon={meta.icon} accent={accent} size={48} tone="solid" />}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                  {meta?.exam ?? 'WAEC · JAMB'}
                </p>
                <h1 className="font-serif text-[1.75rem] font-semibold tracking-[-0.025em]">
                  {subjectLabel}
                </h1>
              </div>
            </div>
          

          
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Exam board
            </p>
            {/* Segmented control */}
            <div className="mt-3 inline-flex rounded-2xl border border-line bg-surface p-1 shadow-[var(--shadow-sm)]">
              {(['ALL', 'JAMB', 'WAEC', 'NECO'] as ExamBoard[]).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setExam(e)}
                  className="rounded-xl px-3.5 py-2 text-[12.5px] font-medium transition-all duration-300"
                  style={
                    exam === e
                      ? { background: accent, color: '#fff' }
                      : { color: 'var(--ink-muted)' }
                  }
                >
                  {e === 'ALL' ? 'All' : e}
                  <span className="ml-1 opacity-60">{counts[e]}</span>
                </button>
              ))}
            </div>
          

          
            <div className="mt-7 rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-md)]">
              <div className="flex flex-wrap items-center gap-2.5">
                {exam !== 'ALL' && <ExamBadge exam={exam} />}
                <h2 className="font-serif text-xl font-semibold">
                  {total} question{total === 1 ? '' : 's'}
                </h2>
              </div>
              <p className="mt-2 text-[14px] text-ink-muted">
                {exam === 'ALL'
                  ? 'Mixed JAMB, WAEC and NECO style items for this subject.'
                  : `${exam}-style questions. Feedback after each answer.`}
              </p>

              {/* Timed toggle */}
              <div className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-line bg-sunken p-4">
                <div>
                  <p className="text-[14px] font-medium text-ink">Timed mode</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">
                    {perQ}s per question · exam pressure
                    {!isPro() && (
                      <Link
                        href="/pricing"
                        className="ml-1 font-medium text-streak no-underline"
                      >
                        Pro
                      </Link>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={timed}
                  aria-label="Timed mode"
                  onClick={() => {
                    if (!timed && !canAccessTimedMocks()) {
                      window.location.href = '/pricing'
                      return
                    }
                    setTimed(!timed)
                  }}
                  className="relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors duration-300"
                  style={{ background: timed ? accent : 'var(--line-strong)' }}
                >
                  <span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform duration-300"
                    style={{ transform: timed ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={start}
                disabled={!total}
                className="mt-6 w-full rounded-xl py-3 text-[14px] font-semibold text-white transition-transform duration-200 hover:scale-[1.01] active:scale-100 disabled:opacity-50"
                style={{ background: accent }}
              >
                Start practice
              </button>
            </div>
          
        </div>
      </main>
    )
  }

  if (phase === 'done') {
    const pct = total ? Math.round((correctCount / total) * 100) : 0
    const R = 54
    const C = 2 * Math.PI * R
    const ringColor = pct >= 70 ? '#2f9e5f' : pct >= 50 ? '#d4763b' : '#c4485f'

    return (
      <main className="min-h-dvh bg-paper text-ink">
        <div className="mx-auto max-w-2xl px-4 py-16">
          
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-streak">
                Session complete
              </p>

              {/* Score ring */}
              <div className="relative mx-auto mt-6 h-36 w-36">
                <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r={R}
                    fill="none"
                    stroke="var(--paper-sunken)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={R}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C - (C * pct) / 100}
                    style={{ transition: 'stroke-dashoffset 1s var(--ease-out)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="tnum font-serif text-4xl font-semibold" style={{ color: ringColor }}>
                    {pct}%
                  </span>
                  <span className="tnum text-[12px] text-ink-muted">
                    {correctCount} of {total}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-[14px] text-ink-muted">{subjectLabel}</p>
              {exam !== 'ALL' && (
                <div className="mt-3 flex justify-center">
                  <ExamBadge exam={exam} />
                </div>
              )}
            </div>
          

          {misses.length > 0 && (
            
              <div className="mt-10 rounded-2xl border border-line bg-surface p-5 text-left shadow-[var(--shadow-sm)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Review misses
                </p>
                <ul className="mt-4 space-y-4">
                  {misses.map((m) => (
                    <li key={m.id} className="border-l-[3px] border-danger/40 pl-3.5">
                      <p className="text-[13.5px] font-medium text-ink">{m.question}</p>
                      <p className="mt-1 text-[13px] text-ink-muted">
                        Answer:{' '}
                        <span className="font-semibold" style={{ color: accent }}>
                          {m.answer}
                        </span>{' '}
                        — {m.explanation}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            
          )}

          
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setPhase('idle')}
                className="rounded-xl border border-line bg-surface px-5 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-sunken"
              >
                Practice again
              </button>
              <Link
                href={
                  misses.length
                    ? `/learn/${subject}?focus=${encodeURIComponent(misses[0].question)}${
                        misses[0].topic ? `&topic=${encodeURIComponent(misses[0].topic)}` : ''
                      }`
                    : `/learn/${subject}`
                }
                className="rounded-xl px-5 py-2.5 text-[13.5px] font-medium text-white no-underline"
                style={{ background: accent }}
              >
                {misses.length ? 'Go over what I missed' : 'Learn with tutor'}
              </Link>
            </div>
          
        </div>
      </main>
    )
  }

  // ── Active ────────────────────────────────────────────────────────────────
  const progress = total ? ((index + (revealed ? 1 : 0)) / total) * 100 : 0

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        {/* Progress rail */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-sunken">
          <div
            className="h-full transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%`, background: accent }}
          />
        </div>

        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <button
            type="button"
            onClick={finishEarly}
            className="text-[13px] text-ink-muted transition-colors hover:text-ink"
          >
            End
          </button>

          <p className="tnum flex items-center gap-2 text-[13px] text-ink-muted">
            {index + 1} / {total}
            {exam !== 'ALL' && <ExamBadge exam={exam} size="sm" />}
          </p>

          {timed ? (
            <span
              className={`tnum flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[13px] transition-colors ${
                secondsLeft <= 10
                  ? 'bg-wrong-soft text-wrong'
                  : 'bg-sunken text-ink'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {secondsLeft}s
            </span>
          ) : (
            <span className="w-10" />
          )}
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {q && (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
              {q.exam} · {q.year}
            </p>
            <h2 className="mt-2.5 font-serif text-xl font-semibold leading-snug sm:text-2xl">
              {q.question}
            </h2>

            <div className="mt-7 space-y-2.5">
              {(['A', 'B', 'C', 'D'] as const).map((key) => {
                const selected = picked === key
                const isAnswer = q.answer === key
                const showCorrect = revealed && isAnswer
                const showWrong = revealed && selected && !isAnswer

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={revealed}
                    onClick={() => choose(key)}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left text-[14.5px] transition-all duration-200 ${
                      showCorrect
                        ? 'border-green-500/50 bg-correct-soft'
                        : showWrong
                          ? 'border-danger/40 bg-wrong-soft'
                          : revealed
                            ? 'border-line bg-surface opacity-55'
                            : 'press border-line bg-surface shadow-[var(--shadow-sm)]'
                    }`}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
                      style={
                        showCorrect
                          ? { background: '#2f9e5f', color: '#fff' }
                          : showWrong
                            ? { background: 'var(--danger)', color: '#fff' }
                            : {
                                background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                                color: accent,
                              }
                      }
                    >
                      {key}
                    </span>
                    <span className="flex-1 pt-0.5">{q.options[key]}</span>
                    {showCorrect && <Check className="mt-1 h-4 w-4 shrink-0 text-green-600" />}
                    {showWrong && <X className="mt-1 h-4 w-4 shrink-0 text-wrong" />}
                  </button>
                )
              })}
            </div>

            {revealed && (
              <div className="rise mt-6 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-md)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Explanation
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-ink">{q.explanation}</p>
                <button
                  type="button"
                  onClick={next}
                  className="mt-5 w-full rounded-xl py-3 text-[14px] font-semibold text-white transition-transform duration-200 hover:scale-[1.01] active:scale-100 sm:w-auto sm:px-6"
                  style={{ background: accent }}
                >
                  {index + 1 >= total ? 'See results' : 'Next question'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
