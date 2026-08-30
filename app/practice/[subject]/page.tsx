'use client'

import Link from 'next/link'
import { use, useMemo, useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'
import { getSubject } from '@/app/lib/subjects'
import { questionsForSubject, type PastQuestion } from '@/app/lib/questions'
import { savePractice } from '@/app/lib/progress'

type Phase = 'idle' | 'active' | 'done'

export default function PracticePage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const meta = getSubject(subject)
  const subjectLabel = meta?.name ?? subject
  const bank = useMemo(() => questionsForSubject(subject), [subject])

  const [phase, setPhase] = useState<Phase>(bank.length ? 'idle' : 'done')
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [misses, setMisses] = useState<PastQuestion[]>([])

  const q: PastQuestion | undefined = bank[index]
  const total = bank.length

  function start() {
    setPhase('active')
    setIndex(0)
    setPicked(null)
    setCorrectCount(0)
    setRevealed(false)
    setMisses([])
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

  if (!bank.length) {
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
          <div className="mx-auto flex h-14 max-w-lg items-center px-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted no-underline hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
            Practice · {meta?.exam}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">{subjectLabel}</h1>
          <p className="mt-3 text-[15px] text-ink-muted leading-relaxed">
            {total} questions. Tap an option (A–D). Then read the explanation.
          </p>
          <button
            type="button"
            onClick={start}
            className="mt-8 rounded-full bg-accent px-8 py-3 text-sm font-medium text-paper hover:bg-accent-hover"
          >
            Start
          </button>
        </div>
      </main>
    )
  }

  if (phase === 'done') {
    return (
      <main className="min-h-dvh bg-paper text-ink">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">Finished</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">
            {correctCount}/{total} correct
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            {correctCount === total
              ? 'All correct — nice work. You can still learn more with the tutor.'
              : 'Some were wrong. Use “Explain a wrong one with Ewin” to understand them.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={start}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper hover:bg-accent-hover"
            >
              Retry
            </button>
            <Link
              href={`/learn/${subject}`}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink no-underline hover:border-accent"
            >
              Learn with tutor
            </Link>
            {misses[0] && (
              <Link
                href={`/learn/${subject}?topic=${encodeURIComponent((meta?.topics && meta.topics[0]) || 'General foundations')}&focus=${encodeURIComponent(misses[0].question.slice(0, 160))}&from=practice`}
                className="rounded-full border border-accent bg-accent-soft px-5 py-2.5 text-sm font-medium text-accent no-underline"
              >
                Explain a wrong one with Ewin
              </Link>
            )}
            <Link
              href="/dashboard"
              className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink no-underline"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!q) return null

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <button
            type="button"
            onClick={finishEarly}
            className="text-[13px] text-ink-muted hover:text-ink"
          >
            End
          </button>
          <span className="font-mono text-[12px] text-ink-muted">
            {index + 1} / {total}
          </span>
          <span className="text-[12px] font-medium text-accent">
            {correctCount} correct
          </span>
        </div>
        <div className="h-0.5 bg-line">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-2 flex items-center gap-2 text-[11px] text-ink-muted">
          <span className="font-mono">
            {q.exam} · {q.year}
          </span>
        </div>
        <h2 className="font-serif text-xl font-semibold leading-snug text-ink">{q.question}</h2>

        <div className="mt-6 space-y-2">
          {(['A', 'B', 'C', 'D'] as const).map((key) => {
            const isPicked = picked === key
            const isAnswer = q.answer === key
            let border = 'border-line hover:border-accent'
            let bg = 'bg-white'
            if (revealed) {
              if (isAnswer) {
                border = 'border-accent'
                bg = 'bg-accent-soft'
              } else if (isPicked) {
                border = 'border-red-300'
                bg = 'bg-red-50'
              }
            } else if (isPicked) {
              border = 'border-accent'
            }
            return (
              <button
                key={key}
                type="button"
                disabled={revealed}
                onClick={() => choose(key)}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${border} ${bg} disabled:cursor-default`}
              >
                <span className="font-mono text-[12px] font-medium text-ink-muted">{key}</span>
                <span className="flex-1 text-[14px] text-ink">{q.options[key]}</span>
                {revealed && isAnswer && <Check className="h-4 w-4 shrink-0 text-accent" />}
                {revealed && isPicked && !isAnswer && (
                  <X className="h-4 w-4 shrink-0 text-red-500" />
                )}
              </button>
            )
          })}
        </div>

        {revealed && (
          <div className="mt-6 animate-fade-up rounded-xl border border-line bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
              Explanation
            </p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{q.explanation}</p>
            <button
              type="button"
              onClick={next}
              className="mt-4 w-full rounded-full bg-accent py-2.5 text-sm font-medium text-paper hover:bg-accent-hover"
            >
              {index + 1 >= total ? 'See score' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
