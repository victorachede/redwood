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
import { AppHeader } from '@/components/ui/AppHeader'
import { Diagram } from '@/components/Diagram'
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
      <main className="bg-paper text-ink">
        <AppHeader title={`${subjectLabel} practice`} subtitle="Past-question style" back="/dashboard" />

        <div className="mx-auto max-w-2xl px-4 py-5">
          <div className="flex items-center gap-3.5">
            {meta && <SubjectIcon icon={meta.icon} accent={accent} size={48} tone="solid" />}
            <div className="min-w-0">
              <p className="font-display text-[22px] leading-tight text-ink">{total} questions</p>
              <p className="text-[13px] text-ink-muted">
                {exam === 'ALL' ? 'Mixed boards' : `${exam} style`} · feedback after each answer
              </p>
            </div>
          </div>

          {/* Board filter */}
          <p className="mt-7 margin-label">
            Exam board
          </p>
          <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(['ALL', 'JAMB', 'WAEC', 'NECO'] as ExamBoard[]).map((e) => {
              const on = exam === e
              return (
                <button
                  key={e}
                  type="button"
                  onClick={() => setExam(e)}
                  className="press shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-medium whitespace-nowrap"
                  style={{
                    background: on ? accent : 'var(--surface)',
                    borderColor: on ? accent : 'var(--line)',
                    color: on ? '#fff' : 'var(--ink-muted)',
                  }}
                >
                  {e === 'ALL' ? 'All' : e}
                  <span className="tnum ml-1.5 opacity-65">{counts[e]}</span>
                </button>
              )
            })}
          </div>

          {/* Timed */}
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[14.5px] font-medium text-ink">Timed mode</p>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">
                {perQ}s a question
                {!isPro() && (
                  <Link href="/pricing" className="ml-1.5 font-medium text-primary no-underline">
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
              className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
              style={{ background: timed ? accent : 'var(--line-strong)' }}
            >
              <span
                className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
                style={{ transform: timed ? 'translateX(24px)' : 'translateX(4px)' }}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={start}
            disabled={!total}
            className="press mt-5 w-full rounded-full py-4 text-[15px] font-semibold text-white disabled:opacity-50"
            style={{ background: accent }}
          >
            Start practice
          </button>
        </div>
      </main>
    )
  }

  if (phase === 'done') {
    const pct = total ? Math.round((correctCount / total) * 100) : 0
    const tone = pct >= 70 ? 'var(--correct)' : pct >= 50 ? 'var(--streak)' : 'var(--wrong)'
    const R = 52
    const C = 2 * Math.PI * R

    return (
      <main className="bg-paper text-ink">
        <AppHeader title="Results" subtitle={subjectLabel} back="/dashboard" />

        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="flex flex-col items-center">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
                <circle cx="64" cy="64" r={R} fill="none" stroke="var(--sunken)" strokeWidth="10" />
                <circle
                  cx="64"
                  cy="64"
                  r={R}
                  fill="none"
                  stroke={tone}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C - (C * pct) / 100}
                  style={{ transition: 'stroke-dashoffset 600ms var(--ease)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="tnum font-display text-[30px] leading-none" style={{ color: tone }}>
                  {pct}%
                </span>
                <span className="tnum mt-1 text-[12px] text-ink-muted">
                  {correctCount} of {total}
                </span>
              </div>
            </div>

            <p className="mt-4 text-center text-[15px] text-ink">
              {pct >= 70
                ? 'Strong. Keep the streak going.'
                : pct >= 50
                  ? 'Halfway there. The misses below are the gap.'
                  : 'Rough one — that is useful information. Go over the misses.'}
            </p>
          </div>

          {misses.length > 0 && (
            <div className="mt-8">
              <h2 className="margin-label">
                What you missed
              </h2>
              <ul className="mt-2.5 space-y-2.5">
                {misses.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-2xl border border-line bg-surface p-4"
                  >
                    <p className="text-[14.5px] font-medium leading-snug text-ink">{m.question}</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
                      Answer{' '}
                      <span className="font-semibold text-correct">{m.answer}</span> — {m.explanation}
                    </p>
                    {m.topic && (
                      <p className="mt-2 text-[12px] text-ink-faint">{m.topic}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-2.5">
            <Link
              href={
                misses.length
                  ? `/learn/${subject}?focus=${encodeURIComponent(misses[0].question)}${
                      misses[0].topic ? `&topic=${encodeURIComponent(misses[0].topic)}` : ''
                    }`
                  : `/learn/${subject}`
              }
              className="press rounded-full py-3.5 text-center text-[15px] font-semibold text-white no-underline"
              style={{ background: accent }}
            >
              {misses.length ? 'Go over what I missed' : 'Learn with Ewin'}
            </Link>
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="press rounded-full border border-line bg-surface py-3.5 text-[15px] font-medium text-ink"
            >
              Practise again
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Active ────────────────────────────────────────────────────────────────
  const progress = total ? ((index + (revealed ? 1 : 0)) / total) * 100 : 0

  return (
    <main className="flex h-[calc(100dvh-var(--tabbar-h)-env(safe-area-inset-bottom))] flex-col overflow-hidden bg-paper text-ink md:h-dvh">
      <header className="relative shrink-0 border-b border-line bg-paper">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-sunken">
          <div
            className="h-full transition-[width] duration-300"
            style={{ width: `${progress}%`, background: accent }}
          />
        </div>
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <button
            type="button"
            onClick={finishEarly}
            className="press text-[13.5px] text-ink-muted"
          >
            End
          </button>
          <p className="tnum text-[13.5px] font-medium text-ink">
            {index + 1} / {total}
          </p>
          {timed ? (
            <span
              className="tnum rounded-full px-2.5 py-1 font-mono text-[13px] font-medium"
              style={{
                background: secondsLeft <= 10 ? 'var(--wrong-soft)' : 'var(--sunken)',
                color: secondsLeft <= 10 ? 'var(--wrong)' : 'var(--ink)',
              }}
            >
              {secondsLeft}s
            </span>
          ) : (
            <span className="w-9" />
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-5">
          {q && (
            <>
              <p className="text-[12px] font-medium uppercase tracking-wide text-ink-faint">
                {q.exam} · {q.year}
                {q.topic ? ` · ${q.topic}` : ''}
              </p>
              <h2 className="mt-2 font-display text-[20px] leading-snug text-ink">{q.question}</h2>

              {q.figure && (
                <div className="mt-3.5">
                  <Diagram spec={q.figure} />
                </div>
              )}

              <div className="mt-5 space-y-2.5">
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
                      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-colors ${
                        showWrong ? 'shake' : ''
                      } ${revealed && !showCorrect && !showWrong ? 'opacity-50' : 'press'}`}
                      style={{
                        background: showCorrect
                          ? 'var(--correct-soft)'
                          : showWrong
                            ? 'var(--wrong-soft)'
                            : 'var(--surface)',
                        borderColor: showCorrect
                          ? 'var(--correct)'
                          : showWrong
                            ? 'var(--wrong)'
                            : 'var(--line)',
                      }}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold"
                        style={{
                          background: showCorrect
                            ? 'var(--correct)'
                            : showWrong
                              ? 'var(--wrong)'
                              : `color-mix(in srgb, ${accent} 12%, transparent)`,
                          color: showCorrect || showWrong ? '#fff' : accent,
                        }}
                      >
                        {key}
                      </span>
                      <span className="min-w-0 flex-1 pt-0.5 text-ink">{q.options[key]}</span>
                      {showCorrect && <Check className="pop mt-1 h-4 w-4 shrink-0 text-correct" />}
                      {showWrong && <X className="mt-1 h-4 w-4 shrink-0 text-wrong" />}
                    </button>
                  )
                })}
              </div>

              {revealed && (
                <div className="rise mt-5 rounded-2xl border border-line bg-surface p-4">
                  <p className="margin-label">
                    Why
                  </p>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink">{q.explanation}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {revealed && (
        <div className="shrink-0 border-t border-line bg-paper px-4 pb-safe pt-2.5">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={next}
              className="press w-full rounded-full py-3.5 text-[15px] font-semibold text-white"
              style={{ background: accent }}
            >
              {index + 1 >= total ? 'See results' : 'Next question'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
