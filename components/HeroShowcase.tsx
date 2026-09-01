'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { SUBJECTS, type SubjectId } from '@/app/lib/subjects'
import { SubjectIcon } from './SubjectIcon'

/* ═══════════════════════════════════════════════════════════════════════════
   Auto-playing product showcase.

   The previous demo used `min-h` on a list that grew as messages appended,
   so the card expanded mid-scene and snapped back on remount — shifting the
   whole page every 5.6s. This version makes that impossible:

     1. The frame is a FIXED height. Never min-h, never content-driven.
     2. Every scene is mounted at once, absolutely positioned and stacked.
        Switching scenes is an opacity cross-fade — no mount/unmount snap.
     3. Within a scene the message column is `flex-1` with `justify-end`, so
        messages animate in with opacity/transform while already occupying
        their final slot. Nothing appends, so nothing reflows.

   Net effect: zero layout shift, including under prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════════════════ */

type Msg = {
  role: 'tutor' | 'student'
  body: string
  question?: string
  card?: { q: string; a: string }
  action?: 'CLASSWORK' | 'HOMEWORK'
  brief?: string
}

type Scene = {
  id: SubjectId
  topic: string
  messages: Msg[]
}

const SCENES: Scene[] = [
  {
    id: 'mathematics',
    topic: 'Algebraic processes',
    messages: [
      {
        role: 'tutor',
        body: 'A linear equation is a balanced scale. Do the same to both sides and equality holds.',
        question: 'If 3x − 5 = 10, what is x? Show each step.',
      },
      { role: 'student', body: 'Add 5 to both sides: 3x = 15. Then divide by 3 → x = 5.' },
      {
        role: 'tutor',
        body: 'Correct — clean method. That balance rule underpins all of algebra.',
        card: { q: 'What keeps an equation valid?', a: 'Do the same operation to both sides.' },
      },
    ],
  },
  {
    id: 'physics',
    topic: 'Mechanics',
    messages: [
      {
        role: 'tutor',
        body: "Newton's second law: Force = mass × acceleration. More mass needs more force to reach the same speed.",
        question: 'A 4 kg box accelerates at 3 m/s². What force acts on it?',
      },
      { role: 'student', body: 'F = ma = 4 × 3 = 12 N' },
      {
        role: 'tutor',
        body: 'Exact. Always write the unit — WAEC deducts for a missing N.',
        action: 'CLASSWORK',
        brief: 'Find mass and acceleration too, not just force.',
      },
    ],
  },
  {
    id: 'biology',
    topic: 'Cell biology',
    messages: [
      {
        role: 'tutor',
        body: 'The cell membrane is selectively permeable — it controls what enters and leaves.',
        question: 'Why is that an advantage over being fully open?',
      },
      {
        role: 'student',
        body: 'Only what the cell needs gets in, and waste leaves without harmful things entering.',
      },
      {
        role: 'tutor',
        body: "You covered both entry and exit — that is the full idea, and it would score well.",
        card: {
          q: 'What does selectively permeable mean?',
          a: 'Only certain substances can pass through.',
        },
      },
    ],
  },
  {
    id: 'chemistry',
    topic: 'Periodic table',
    messages: [
      {
        role: 'tutor',
        body: 'Same group means the same number of outer electrons — which is why they react alike.',
        question: 'Sodium is in Group I. What does that tell you about its electrons?',
      },
      { role: 'student', body: 'It has one electron in its outer shell.' },
      {
        role: 'tutor',
        body: 'Correct. That lone electron is easily lost, so Group I metals react vigorously with water.',
        action: 'HOMEWORK',
        brief: 'Word equations for sodium, potassium and lithium in water.',
      },
    ],
  },
  {
    id: 'english',
    topic: 'Essay & letter',
    messages: [
      {
        role: 'tutor',
        body: 'A body paragraph has three parts: topic sentence, evidence, explanation. The first makes a promise; the rest keeps it.',
        question: 'What job does the topic sentence do?',
      },
      { role: 'student', body: 'It tells the reader what the paragraph is about.' },
      {
        role: 'tutor',
        body: 'Right — a contract. Every sentence after it must deliver on that one claim.',
        card: {
          q: 'Three parts of a body paragraph?',
          a: 'Topic sentence, evidence, explanation.',
        },
      },
    ],
  },
  {
    id: 'economics',
    topic: 'Demand & supply',
    messages: [
      {
        role: 'tutor',
        body: 'Demand rises as price falls, so the curve slopes down to the right.',
        question: 'If the price of rice drops, what happens to quantity demanded?',
      },
      { role: 'student', body: 'It increases, because more people can afford it.' },
      {
        role: 'tutor',
        body: 'Note the wording: quantity demanded moves along the curve. Demand shifts only when something other than price changes.',
        card: {
          q: 'Movement along vs shift of the demand curve?',
          a: 'Price change moves along it; anything else shifts it.',
        },
      },
    ],
  },
]

const SCENE_DURATION = 6200

function subjectFor(id: SubjectId) {
  return SUBJECTS.find((s) => s.id === id)!
}

/* ── Message ─────────────────────────────────────────────────────────────── */

function Bubble({ msg, accent, delay }: { msg: Msg; accent: string; delay: number }) {
  const isStudent = msg.role === 'student'

  return (
    <div
      className={`msg-in flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="mb-1 px-1 text-[10px] font-medium tracking-wide text-ink-subtle">
        {isStudent ? 'You' : 'Ewin'}
      </span>

      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-[1.55] ${
          isStudent
            ? 'bg-gradient-to-br from-[#0e1b3a] to-[#1f3563] text-white shadow-[0_6px_18px_-8px_rgba(14,27,58,0.5)]'
            : 'border border-line bg-white text-ink shadow-[var(--shadow-sm)]'
        }`}
      >
        <p>{msg.body}</p>

        {msg.question && (
          <div
            className="mt-2.5 rounded-lg border-l-[3px] px-2.5 py-2"
            style={{
              borderColor: accent,
              background: `color-mix(in srgb, ${accent} 7%, transparent)`,
            }}
          >
            <p
              className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: accent }}
            >
              Your turn
            </p>
            <p className="text-[12.5px] font-medium text-ink">{msg.question}</p>
          </div>
        )}

        {msg.card && (
          <div className="mt-2.5 rounded-lg border border-gold-500/25 bg-gold-500/[0.07] px-2.5 py-2">
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-gold-600">
              Study card saved
            </p>
            <p className="text-[12px] font-medium text-ink">{msg.card.q}</p>
            <p className="mt-0.5 text-[12px] text-ink-muted">{msg.card.a}</p>
          </div>
        )}

        {msg.action && (
          <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-navy-700/[0.06] px-2.5 py-2">
            <span className="mt-px rounded-md bg-navy-700 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
              {msg.action === 'CLASSWORK' ? 'Classwork' : 'Homework'}
            </span>
            <p className="flex-1 text-[11.5px] leading-snug text-ink-muted">{msg.brief}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Scene ───────────────────────────────────────────────────────────────── */

function SceneCard({ scene, active }: { scene: Scene; active: boolean }) {
  const subject = subjectFor(scene.id)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-line bg-[var(--paper-elevated)] shadow-[var(--shadow-xl)]">
      {/* Header — fixed height */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-line px-4 py-3">
        <SubjectIcon icon={subject.icon} accent={subject.accent} size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight text-ink">
            {subject.name}
          </p>
          <p className="truncate text-[11px] leading-tight text-ink-muted">{scene.topic}</p>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: `color-mix(in srgb, ${subject.accent} 12%, transparent)`,
            color: subject.accent,
          }}
        >
          <Sparkles className="h-2.5 w-2.5" />
          Live
        </span>
      </div>

      {/* Messages — flex-1 so the card height is set by the frame, not content.
          The mask fades the top edge so a long scene reads as scrolled rather
          than chopped. */}
      <div
        className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden p-4"
        style={{
          maskImage: 'linear-gradient(180deg, transparent 0, #000 7%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 7%)',
        }}
      >
        {scene.messages.map((msg, i) => (
          <Bubble
            key={i}
            msg={msg}
            accent={subject.accent}
            delay={active ? 220 + i * 520 : 0}
          />
        ))}
      </div>

      {/* Composer stub — fixed height, visual only */}
      <div className="shrink-0 px-4 pb-4">
        <div className="flex items-center gap-2 rounded-full border border-line bg-paper-sunken px-3.5 py-2.5">
          <span className="flex-1 text-[12px] text-ink-subtle">Message Ewin…</span>
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: subject.accent }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 20V4M12 4L5 11M12 4l7 7"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Showcase ────────────────────────────────────────────────────────────── */

export function HeroShowcase() {
  const [active, setActive] = useState(0)
  // Bumped on every scene change so the entrance animation replays. Safe to
  // remount on: it happens inside a fixed-height absolutely-positioned box.
  const [run, setRun] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setActive((i) => (i + 1) % SCENES.length)
      setRun((r) => r + 1)
    }, SCENE_DURATION)
    return () => clearTimeout(t)
  }, [active])

  return (
    <div className="w-full">
      {/* FIXED height frame — the guarantee against layout shift */}
      <div data-hero-frame className="relative h-[500px] sm:h-[540px]">
        {SCENES.map((scene, i) => (
          <div
            key={scene.id}
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{ opacity: i === active ? 1 : 0 }}
            aria-hidden={i !== active}
          >
            <SceneCard
              key={i === active ? run : 'idle'}
              scene={scene}
              active={i === active}
            />
          </div>
        ))}
      </div>

      {/* Subject rail — doubles as progress. Scrolls rather than wrapping so
          the block below it never moves. */}
      <div className="mt-4 flex justify-start gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden">
        {SCENES.map((scene, i) => {
          const subject = subjectFor(scene.id)
          const isActive = i === active
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => {
                setActive(i)
                setRun((r) => r + 1)
              }}
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-all duration-300"
              style={{
                background: isActive
                  ? `color-mix(in srgb, ${subject.accent} 14%, transparent)`
                  : 'transparent',
                color: isActive ? subject.accent : 'var(--ink-subtle)',
              }}
              aria-label={`Show ${subject.name} example`}
              aria-current={isActive}
            >
              {subject.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
