import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'
import { SUBJECTS } from '@/app/lib/subjects'
import { SubjectIcon } from '@/components/SubjectIcon'
import { ExamBadgeRow } from '@/components/ExamBadges'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { formatNgn, PLANS } from '@/app/lib/billing'
import { HeroLesson } from '@/components/marketing/HeroLesson'

/**
 * The landing page.
 *
 * Built on the ruled margin (see .ruled in globals.css): section labels live
 * in the margin, content to the right of the rule. That does two things the
 * previous page could not. It gives desktop a real structure instead of a
 * 600px phone column floating in 1440px of nothing, and it breaks the
 * six-identical-white-cards rhythm that made every section read at the same
 * volume.
 *
 * Sections deliberately alternate weight: paper, then ink, then paper. A page
 * that never changes texture cannot emphasise anything.
 */

const STEPS = [
  {
    n: '01',
    title: 'One idea. Not a chapter.',
    body:
      'Ewin explains a single thing in a few sentences, in plain English, using an example you have actually seen — naira, danfo fares, a market scale. Then it stops.',
  },
  {
    n: '02',
    title: 'Then it makes you answer.',
    body:
      'In your own words. Not A, B, C or D. Guessing a letter is how you find out in the exam hall that you never knew it — and by then it is too late to fix.',
  },
  {
    n: '03',
    title: 'And it names what broke.',
    body:
      'Not "good try". The exact step that went wrong, why it went wrong, and the same question again until it holds. That is the whole loop.',
  },
]

const NOTS = [
  'Give you answers to copy into your assignment',
  'Replace your teacher, or your textbook',
  'Sit the exam for you — that part is yours',
]

const FAQS = [
  {
    q: 'Is it really free?',
    a: 'Yes. Six subjects, the tutor, and practice questions cost nothing and need no card. Pro exists for mock season — timed full papers and unlimited drills — and it is ₦2,500 a month, cancel whenever.',
  },
  {
    q: 'How is this different from asking ChatGPT?',
    a: 'ChatGPT answers you. Ewin refuses to, until you have tried. It remembers that ratios broke last Tuesday and opens there. It knows what a WAEC theory question looks like versus a JAMB objective. And it will not hand you a finished assignment.',
  },
  {
    q: 'Do I need an account?',
    a: 'Not to start. Open a subject and begin. Sign up when you want your streak, cards and progress on every device instead of just this phone.',
  },
  {
    q: 'Will it work on my phone?',
    a: 'It is built for a mid-range Android on mobile data, at night. You can install it to your home screen, and your cards and practice keep working offline.',
  },
  {
    q: 'Is this cheating?',
    a: 'It would be, if it did your homework. It will not. It makes you produce the answer yourself — which is the only part that shows up in your score.',
  },
]

export default function Home() {
  const free = PLANS.free
  const pro = PLANS.pro

  return (
    <main className="bg-paper text-ink">
      <SiteHeader />

      {/* ── Hero ──────────────────────────────────────────────────────────
          The old hero put a static picture of the product beside the words.
          This types out a real exchange instead: the whole pitch is "it makes
          you answer", so the page should demonstrate that rather than assert
          it. It reserves its own height, so nothing below it moves. */}
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-10 lg:px-8 lg:pb-20 lg:pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <p className="margin-label">For WAEC · NECO · JAMB</p>

            {/* Breaks are set by hand. Left to wrap, "idea" orphans onto its
                own line at desktop width and the emphasis falls apart. */}
            <h1 className="mt-6 font-display text-3xl">
              You do not need
              <br />
              more hours.
              <br />
              <em className="not-italic text-primary">You need one idea</em>{' '}
              to actually stick.
            </h1>

            <p className="mt-6 max-w-lg text-md leading-relaxed text-ink-muted">
              Ewin teaches one thing, then makes you prove you got it — and tells you exactly
              which step you fumbled. Reading a topic and knowing it are different, and only
              one of them shows up in your result.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="press inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-[15px] font-semibold text-on-primary no-underline"
              >
                Start learning — free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="press inline-flex items-center justify-center rounded-full border border-line-strong bg-surface px-7 py-4 text-[15px] font-semibold text-ink no-underline"
              >
                See pricing
              </Link>
            </div>

            <p className="mt-4 text-sm text-ink-faint">
              No card. No account needed to start.
            </p>
          </div>

          <HeroLesson />
        </div>

        <div className="mt-16 border-t border-line pt-7 lg:mt-24">
          <ExamBadgeRow />
        </div>
      </section>

      {/* ── How it works — set in the margin, numbered like worked steps ── */}
      <section className="border-y border-line bg-sunken">
        <div className="ruled mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <div>
            <p className="margin-label">How a session goes</p>
          </div>

          <div>
            <h2 className="font-display text-2xl">Ten minutes. One idea. Proof.</h2>
            <p className="mt-4 max-w-xl text-md leading-relaxed text-ink-muted">
              Every session is the same three beats, because the loop is what makes it stick —
              not the length.
            </p>

            <ol className="mt-12 space-y-11">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-6 sm:gap-8">
                  <span className="margin-num shrink-0">{s.n}</span>
                  <div className="border-l border-line pl-6 sm:pl-8">
                    <h3 className="font-display text-xl">{s.title}</h3>
                    <p className="mt-2.5 max-w-xl text-[15.5px] leading-relaxed text-ink-muted">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Subjects — the six accents finally used at full strength ─────
          They were 24px tinted chips before, which wasted the one part of the
          identity that was already doing work. */}
      <section className="ruled mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div>
          <p className="margin-label">What you can study</p>
        </div>

        <div>
          <h2 className="font-display text-2xl">Six subjects. Thirty topics.</h2>
          <p className="mt-4 max-w-xl text-md leading-relaxed text-ink-muted">
            Past-question practice written in the style of each board, so a WAEC theory question
            reads like one and a JAMB objective reads like one.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {SUBJECTS.map((s) => (
              <Link
                key={s.id}
                href={`/learn/${s.id}`}
                className="press group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 no-underline"
              >
                {/* The accent as a real edge, not a decorative square. */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1"
                  style={{ background: s.accent }}
                />
                <div className="flex items-start gap-3.5 pl-2">
                  <SubjectIcon icon={s.icon} accent={s.accent} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg leading-tight text-ink">{s.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{s.blurb}</p>
                    <p className="mt-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
                      {s.topics.length} topics · {s.exam}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── The refusal — full-bleed ink. The page's one hard cut. ──────── */}
      <section className="bg-hero text-on-hero">
        <div className="ruled mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <div>
            <p className="margin-label" style={{ color: 'var(--on-hero-dim)' }}>
              Where it stops
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl" style={{ color: 'var(--on-hero)' }}>
              Three things Ewin will not do.
            </h2>
            <p className="mt-4 max-w-xl text-md leading-relaxed" style={{ color: 'var(--on-hero-dim)' }}>
              Worth saying plainly, so nobody has to find out the hard way.
            </p>

            <ul className="mt-10 space-y-px overflow-hidden rounded-2xl">
              {NOTS.map((n) => (
                <li
                  key={n}
                  className="flex items-center gap-4 bg-white/[0.06] px-5 py-5 text-[15.5px]"
                  style={{ color: 'var(--on-hero)' }}
                >
                  <X className="h-4 w-4 shrink-0" style={{ color: 'var(--rule)' }} />
                  {n}
                </li>
              ))}
            </ul>

            <p className="mt-7 max-w-xl text-[15px] leading-relaxed" style={{ color: 'var(--on-hero-dim)' }}>
              It makes you produce the answer yourself. That is the part that shows up in your
              score, and it is the only part worth paying for.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section className="ruled mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div>
          <p className="margin-label">What it costs</p>
        </div>

        <div>
          <h2 className="font-display text-2xl">Free covers real studying.</h2>
          <p className="mt-4 max-w-xl text-md leading-relaxed text-ink-muted">
            Pro is for mock season — timed full papers and unlimited drills. If you are not
            sitting mocks yet, stay on Free.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                {free.name}
              </p>
              <p className="mt-4 font-display text-xl">
                {formatNgn(0)}
                <span className="ml-1.5 text-sm text-ink-muted">forever</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {free.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14.5px] text-ink-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-correct" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="press mt-7 block rounded-full border border-line-strong bg-surface py-3.5 text-center text-[14.5px] font-semibold text-ink no-underline"
              >
                Start free
              </Link>
            </div>

            <div className="relative rounded-2xl border-2 border-primary bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {pro.name}
              </p>
              <p className="mt-4 font-display text-xl">
                {formatNgn(pro.priceMonthlyNgn)}
                <span className="ml-1.5 text-sm text-ink-muted">/month</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {pro.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14.5px] text-ink-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-correct" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="press mt-7 block rounded-full bg-primary py-3.5 text-center text-[14.5px] font-semibold text-on-primary no-underline"
              >
                Go Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-sunken">
        <div className="ruled mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <div>
            <p className="margin-label">Straight answers</p>
          </div>

          <div className="max-w-2xl">
            {FAQS.map((f) => (
              <details key={f.q} className="group border-b border-line py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-display text-lg leading-snug text-ink">{f.q}</span>
                  <span
                    aria-hidden
                    className="shrink-0 text-ink-muted transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15.5px] leading-relaxed text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Close ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 text-center lg:px-8 lg:py-28">
        <h2 className="mx-auto max-w-2xl font-display text-2xl">
          The exam is coming either way.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-md leading-relaxed text-ink-muted">
          Ten honest minutes tonight will beat three hours of cramming the week before. Pick one
          topic and find out what you actually know.
        </p>
        <Link
          href="/dashboard"
          className="press mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-[15px] font-semibold text-on-primary no-underline"
        >
          Start with one topic
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <SiteFooter />
    </main>
  )
}
