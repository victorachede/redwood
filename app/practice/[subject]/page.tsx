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
import { savePractice } from '@/app/lib/progress'
import { ExamBadge } from '@/components/ExamBadges'
import { canAccessTimedMocks, isPro } from '@/app/lib/billing'

type Phase = 'idle' | 'active' | 'done'

export default function PracticePage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const meta = getSubject(subject)
  const subjectLabel = meta?.name ?? subject

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
    setPhase('done')
  }

  if (!counts.ALL) {
    return (
      <main className="min-h-dvh bg-paper px-4 py-16 text-center text-ink">
        <p className="text-sm text-ink-muted">No practice questions for this subject yet.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-accent">
          ← Dashboard
        </Link>
      </main>
    )
  }

  if (phase === 'idle') {
    return (
      <main className="min-h-dvh bg-paper text-ink">
        <header className="border-b border-line">
          <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
            <Link href="/dashboard" className="text-ink-muted hover:text-ink">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-[15px] font-semibold">{subjectLabel} practice</p>
              <p className="text-[11px] text-ink-muted">Past-style questions · pick an exam board</p>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-2xl px-4 py-10">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Exam board</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['ALL', 'JAMB', 'WAEC', 'NECO'] as ExamBoard[]).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setExam(e)}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                  exam === e
                    ? 'border-accent bg-accent text-[var(--on-accent)]'
                    : 'border-line bg-[var(--paper-elevated)] text-ink hover:border-accent'
                }`}
              >
                {e === 'ALL' ? 'All boards' : e}{' '}
                <span className="opacity-70">({counts[e]})</span>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-[var(--paper-elevated)] p-6">
            <div className="flex flex-wrap items-center gap-2">
              {exam !== 'ALL' && <ExamBadge exam={exam} />}
              <h1 className="font-serif text-xl font-semibold">
                {total} question{total === 1 ? '' : 's'}
              </h1>
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              {exam === 'ALL'
                ? 'Mixed JAMB, WAEC and NECO style items for this subject.'
                : `${exam}-style questions. Feedback after each answer.`}
            </p>

            <label className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-paper p-3 text-sm">
              <input
                type="checkbox"
                checked={timed}
                onChange={(e) => {
                  if (e.target.checked && !canAccessTimedMocks()) {
                    window.location.href = '/pricing'
                    return
                  }
                  setTimed(e.target.checked)
                }}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-ink">Timed mode</span>
                <span className="block text-[12px] text-ink-muted">
                  {perQ}s per question · exam pressure{' '}
                  {!isPro() && (
                    <Link href="/pricing" className="text-accent no-underline">
                      (Pro)
                    </Link>
                  )}
                </span>
              </span>
            </label>

            <button
              type="button"
              onClick={start}
              disabled={!total}
              className="mt-6 w-full rounded-full bg-accent py-2.5 text-sm font-medium text-[var(--on-accent)] hover:bg-accent-hover disabled:opacity-50"
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
    return (
      <main className="min-h-dvh bg-paper text-ink">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-xs uppercase tracking-wider text-ink-muted">Session complete</p>
          <p className="mt-3 font-serif text-4xl font-semibold">
            {correctCount}/{total}
          </p>
          <p className="mt-1 text-sm text-ink-muted">{pct}% correct · {subjectLabel}</p>
          {exam !== 'ALL' && (
            <div className="mt-3 flex justify-center">
              <ExamBadge exam={exam} />
            </div>
          )}
          {misses.length > 0 && (
            <div className="mt-8 text-left rounded-2xl border border-line bg-[var(--paper-elevated)] p-5">
              <p className="text-sm font-semibold">Review misses</p>
              <ul className="mt-3 space-y-3">
                {misses.map((m) => (
                  <li key={m.id} className="text-[13px]">
                    <p className="text-ink">{m.question}</p>
                    <p className="mt-1 text-ink-muted">
                      Answer: <span className="text-accent font-medium">{m.answer}</span> —{' '}
                      {m.explanation}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="rounded-full border border-line px-4 py-2 text-sm hover:border-accent"
            >
              Practice again
            </button>
            <Link
              href={`/learn/${subject}`}
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-[var(--on-accent)] no-underline hover:bg-accent-hover"
            >
              Learn with tutor
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // active
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <button type="button" onClick={finishEarly} className="text-sm text-ink-muted hover:text-ink">
            End
          </button>
          <p className="text-[13px] text-ink-muted">
            {index + 1} / {total}
            {exam !== 'ALL' && (
              <span className="ml-2 inline-block align-middle">
                <ExamBadge exam={exam} size="sm" />
              </span>
            )}
          </p>
          {timed ? (
            <span
              className={`flex items-center gap-1 font-mono text-sm ${
                secondsLeft <= 10 ? 'text-danger' : 'text-ink'
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
            <p className="text-[11px] text-ink-muted">
              {q.exam} · {q.year}
            </p>
            <h2 className="mt-2 font-serif text-lg font-semibold leading-snug sm:text-xl">
              {q.question}
            </h2>
            <div className="mt-6 space-y-2">
              {(['A', 'B', 'C', 'D'] as const).map((key) => {
                const selected = picked === key
                const isAnswer = q.answer === key
                let cls =
                  'w-full rounded-xl border border-line bg-[var(--paper-elevated)] px-4 py-3 text-left text-sm transition-colors'
                if (revealed && isAnswer) cls += ' border-accent bg-accent-soft'
                else if (revealed && selected && !isAnswer) cls += ' border-danger/50 opacity-80'
                else if (selected) cls += ' border-accent'
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={revealed}
                    onClick={() => choose(key)}
                    className={cls}
                  >
                    <span className="font-semibold text-accent">{key}.</span> {q.options[key]}
                    {revealed && isAnswer && (
                      <Check className="ml-2 inline h-4 w-4 text-accent" />
                    )}
                    {revealed && selected && !isAnswer && (
                      <X className="ml-2 inline h-4 w-4 text-danger" />
                    )}
                  </button>
                )
              })}
            </div>
            {revealed && (
              <div className="mt-5 rounded-xl border border-line bg-[var(--paper-elevated)] p-4 text-sm">
                <p className="font-medium text-ink">Explanation</p>
                <p className="mt-1 text-ink-muted">{q.explanation}</p>
                <button
                  type="button"
                  onClick={next}
                  className="mt-4 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-[var(--on-accent)] hover:bg-accent-hover"
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
