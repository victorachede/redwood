import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, MessageSquareText, PenLine, Target, X } from 'lucide-react'
import { SUBJECTS } from '@/app/lib/subjects'
import { SubjectIcon } from '@/components/SubjectIcon'
import { ExamBadgeRow } from '@/components/ExamBadges'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { formatNgn, PLANS } from '@/app/lib/billing'

const STEPS = [
  {
    n: '1',
    title: 'It explains one idea',
    body: 'Not a chapter. One idea, in a few sentences, in plain English — with an example you have actually seen before.',
    Icon: MessageSquareText,
  },
  {
    n: '2',
    title: 'Then it asks you',
    body: 'You type the answer in your own words. Not A, B, C or D. Guessing a letter is how you find out you did not know it — in the hall.',
    Icon: Target,
  },
  {
    n: '3',
    title: 'And it tells you what broke',
    body: 'Not "good try". Ewin names the exact step that went wrong, why it went wrong, and asks you again.',
    Icon: PenLine,
  },
]

const HONEST = [
  'Give you answers to copy into your assignment',
  'Replace your teacher, or your textbook',
  'Help you in the exam hall — you are on your own there',
]

const FAQS = [
  {
    q: 'Is it really free?',
    a: 'Yes. Tutor sessions, practice questions and study cards cost nothing, with no card and no trial that quietly ends. Pro adds timed full mocks and unlimited drills for ₦2,500 a month, paid with Paystack.',
  },
  {
    q: 'How is this different from asking ChatGPT?',
    a: 'A general chatbot answers your question and stops. Ewin makes you answer, marks what you wrote, and remembers next week which topic you got wrong. It is built around WAEC, NECO and JAMB phrasing, and it knows that a missing unit costs you marks.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Open a subject and start. Create an account only when you want your streak and progress to follow you to another phone.',
  },
  {
    q: 'Will it work on my phone?',
    a: 'It is built for a phone first, and for a normal connection. You can add it to your home screen and open it like an app.',
  },
  {
    q: 'Is this cheating?',
    a: 'It is the opposite. Ewin will not hand you an answer to copy — it makes you produce the answer yourself, which is the part that actually shows up in your score.',
  },
]

export default function Home() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Image
              src="/logo-mark.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg"
              priority
            />
            <span className="font-display text-[17px] text-ink">Ewin</span>
          </Link>
          <div className="flex-1" />
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="press rounded-full bg-primary px-4 py-2 text-[13.5px] font-medium text-on-primary no-underline"
          >
            Start
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-12 sm:pt-16">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-correct" />
          Built for WAEC · NECO · JAMB
        </p>

        <h1 className="font-display text-[clamp(2rem,8vw,3.25rem)] leading-[1.08] text-ink">
          Stop cramming.
          <br />
          Start knowing.
        </h1>

        <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-ink-muted">
          Most study apps talk at you. Ewin explains one idea, then makes you answer a question
          about it — and tells you exactly which step you got wrong. That is the whole difference
          between reading a topic and actually knowing it.
        </p>

        <div className="mt-7 flex flex-wrap gap-2.5">
          <Link
            href="/dashboard"
            className="press inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-medium text-on-primary no-underline"
          >
            Start learning — free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="press inline-flex items-center rounded-full border border-line bg-surface px-6 py-3.5 text-[15px] font-medium text-ink no-underline"
          >
            See pricing
          </Link>
        </div>

        <p className="mt-3 text-[13px] text-ink-muted">
          No card. No account needed to start.
        </p>

        {/* A still of the real thing, not an animation that moves the page */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-md)]">
          <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
            <SubjectIcon icon="Sigma" accent="#3b6fd4" size={30} />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-ink">Mathematics</p>
              <p className="truncate text-[11.5px] text-ink-muted">Algebraic processes</p>
            </div>
          </div>

          <div className="space-y-3.5 p-4">
            <p className="text-[14.5px] leading-[1.6] text-ink">
              A linear equation is a balanced scale. Do the same to both sides and it stays true.
            </p>

            <div
              className="rounded-xl px-3.5 py-3"
              style={{
                background: 'var(--primary-soft)',
                borderLeft: '3px solid var(--primary)',
              }}
            >
              <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary">
                Your turn
              </p>
              <p className="text-[14.5px] font-medium text-ink">
                If 3x − 5 = 10, what is x? Show each step.
              </p>
            </div>

            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[14.5px] text-on-primary">
                Add 5 to both sides: 3x = 15, so x = 5.
              </p>
            </div>

            <p className="text-[14.5px] leading-[1.6] text-ink">
              Correct, and you showed the step. That balance rule is the whole of algebra.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Built around
          </p>
          <ExamBadgeRow />
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className="border-y border-line bg-sunken">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="font-display text-[26px] text-ink">How a session goes</h2>
          <p className="mt-1.5 text-[14.5px] text-ink-muted">
            About ten minutes. One idea at a time.
          </p>
          <ul className="mt-6 space-y-4">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[14px] font-bold text-primary">
                  {s.n}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[16px] font-semibold text-ink">{s.title}</h3>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-ink-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Subjects ──────────────────────────────────────────────────── */}
      <section id="subjects" className="mx-auto max-w-3xl scroll-mt-16 px-4 py-12">
        <h2 className="font-display text-[26px] text-ink">What you can study</h2>
        <p className="mt-1.5 text-[14.5px] text-ink-muted">
          Six subjects, thirty topics, and past-question practice in the style of each board.
        </p>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {SUBJECTS.map((s) => (
            <Link
              key={s.id}
              href={`/learn/${s.id}`}
              className="press flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3.5 no-underline"
            >
              <SubjectIcon icon={s.icon} accent={s.accent} size={42} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-ink">{s.name}</p>
                <p className="truncate text-[13px] text-ink-muted">{s.blurb}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── What it won't do ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="font-display text-[26px] text-ink">What Ewin will not do</h2>
        <p className="mt-1.5 text-[14.5px] text-ink-muted">
          Worth saying plainly, so nobody is surprised.
        </p>
        <ul className="mt-5 space-y-2.5">
          {HONEST.map((h) => (
            <li
              key={h}
              className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5"
            >
              <X className="mt-0.5 h-4 w-4 shrink-0 text-wrong" />
              <span className="min-w-0 text-[14.5px] leading-relaxed text-ink">{h}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">
          It makes you produce the answer yourself. That is the part that shows up in your score.
        </p>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-sunken">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="font-display text-[26px] text-ink">Free covers real studying</h2>
          <p className="mt-1.5 text-[14.5px] text-ink-muted">
            Pro is for mock season — timed papers and unlimited drills.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Free
              </p>
              <p className="mt-2 font-display text-[30px] text-ink">
                {formatNgn(0)}
                <span className="ml-1 text-[14px] font-normal text-ink-muted">/mo</span>
              </p>
              <ul className="mt-4 space-y-2">
                {PLANS.free.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2 text-[13.5px] text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                    <span className="min-w-0">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="press mt-5 block rounded-full border border-line py-3 text-center text-[14px] font-medium text-ink no-underline"
              >
                Start free
              </Link>
            </div>

            <div className="rounded-2xl border-2 border-primary bg-surface p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">
                Pro
              </p>
              <p className="mt-2 font-display text-[30px] text-ink">
                {formatNgn(PLANS.pro.priceMonthlyNgn)}
                <span className="ml-1 text-[14px] font-normal text-ink-muted">/mo</span>
              </p>
              <ul className="mt-4 space-y-2">
                {PLANS.pro.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2 text-[13.5px] text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-correct" />
                    <span className="min-w-0">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="press mt-5 block rounded-full bg-primary py-3 text-center text-[14px] font-medium text-on-primary no-underline"
              >
                {PLANS.pro.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="font-display text-[26px] text-ink">Straight answers</h2>
        <div className="mt-5 space-y-2.5">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-line bg-surface px-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">{f.q}</span>
                <span className="shrink-0 text-ink-faint transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-4 text-[14.5px] leading-relaxed text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Close ─────────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-sunken">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <h2 className="font-display text-[26px] text-ink">Exam day is coming either way</h2>
          <p className="mx-auto mt-2 max-w-sm text-[14.5px] text-ink-muted">
            Ten honest minutes tonight beat three hours of cramming the week before.
          </p>
          <Link
            href="/dashboard"
            className="press mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-on-primary no-underline"
          >
            Start with one topic
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink-muted">
            <Link href="/pricing" className="no-underline hover:text-ink">Pricing</Link>
            <Link href="/support" className="no-underline hover:text-ink">Support</Link>
            <Link href="/terms" className="no-underline hover:text-ink">Terms</Link>
            <Link href="/privacy" className="no-underline hover:text-ink">Privacy</Link>
          </div>
          <p className="mt-4 text-[12px] text-ink-muted">
            © {new Date().getFullYear()} Ewin Academy · Not affiliated with WAEC, JAMB or NECO
          </p>
        </div>
      </footer>
    </main>
  )
}
