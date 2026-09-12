import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'
import { SUBJECTS } from '@/app/lib/subjects'
import { SubjectIcon } from '@/components/SubjectIcon'
import { ExamBadgeRow } from '@/components/ExamBadges'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { formatNgn, PLANS } from '@/app/lib/billing'
import { Ayo, Kito, Zuri, Sparkle } from '@/components/mascots/Mascots'
import { Motion } from '@/components/marketing/Motion'
import { HeroLesson } from '@/components/marketing/HeroLesson'

/**
 * The landing page.
 *
 * Loud on purpose. The audience is sixteen, on a phone, and has three other
 * apps open — a quiet editorial page loses that fight before the first
 * sentence. So: flat saturated blocks, a heavy ink outline, hard offset
 * shadows, and three drawn characters carrying the argument.
 *
 * What it deliberately keeps from the restrained version underneath it: real
 * sentences rather than slogans, no invented statistics, and no testimonials
 * from students who do not exist yet.
 */

const STEPS = [
  {
    n: '01',
    title: 'One idea. Not a chapter.',
    body:
      'A few sentences, plain English, with an example you have actually seen — naira, danfo fares, a market scale. Then it stops and waits for you.',
    bg: 'var(--play-marigold)',
  },
  {
    n: '02',
    title: 'Then it makes you answer.',
    body:
      'Typed out, in your own words. Guessing a letter is how you find out in the exam hall that you never really knew it — and by then it is too late.',
    bg: 'var(--play-sky)',
  },
  {
    n: '03',
    title: 'And it names what broke.',
    body:
      'Not "good try". The exact step that went wrong, why it went wrong, and the same question again until it holds.',
    bg: 'var(--play-mint)',
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
    a: 'Yes. Six subjects, the tutor and practice questions cost nothing and never ask for a card. Pro exists for mock season — timed full papers and unlimited drills — at ₦2,500 a month, cancel whenever.',
  },
  {
    q: 'How is this different from asking ChatGPT?',
    a: 'ChatGPT answers you. Ewin refuses to, until you have tried. It remembers that ratios broke last Tuesday and opens there. It knows a WAEC theory question from a JAMB objective. And it will not hand you a finished assignment.',
  },
  {
    q: 'Do I need an account?',
    a: 'Yes, and it takes about twenty seconds — email and a password, or one tap with Google. It is what keeps your streak, your cards and everything the tutor remembers about you, on every device you sign in from.',
  },
  {
    q: 'Will it work on my phone?',
    a: 'It is built for a mid-range Android on mobile data, at night. Install it to your home screen, and your cards and practice keep working with no signal.',
  },
  {
    q: 'Is this cheating?',
    a: 'It would be, if it did your homework. It will not. It makes you produce the answer yourself — the only part that shows up in your score.',
  },
]

export default function Home() {
  const free = PLANS.free
  const pro = PLANS.pro

  return (
    <main className="bg-paper text-ink">
      <Motion />
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="on-play relative overflow-hidden" style={{ background: 'var(--play-sky)' }}>
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-12 lg:px-8 lg:pb-20 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_1fr] lg:gap-14">
            <div>
              <p
                data-hero-item
                className="ink-card-sm inline-block bg-play-card px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-ink"
              >
                Free · WAEC · NECO · JAMB
              </p>

              <h1
                data-hero-item
                className="mt-5 font-display text-[clamp(2.6rem,9vw,4.5rem)] leading-[0.98] text-ink"
              >
                You don&rsquo;t need
                <br />
                more hours.
                <br />
                <span className="relative inline-block">
                  You need it to stick.
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-2.5 rounded-full"
                    style={{ background: 'var(--play-marigold)' }}
                  />
                </span>
              </h1>

              <p data-hero-item className="mt-7 max-w-lg text-[17px] font-medium leading-relaxed text-ink">
                Ewin teaches one thing, makes you prove you got it, then tells you exactly which
                step you fumbled. Reading a topic and knowing it are different — and only one of
                them shows up in your result.
              </p>

              <div data-hero-item className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="ink-btn inline-flex items-center justify-center gap-2 bg-primary px-7 py-4 text-[16px] font-bold text-on-primary no-underline"
                >
                  Start learning — free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="ink-btn inline-flex items-center justify-center bg-play-card px-7 py-4 text-[16px] font-bold text-ink no-underline"
                >
                  See pricing
                </Link>
              </div>

              <p data-hero-item className="mt-4 text-[14px] font-semibold text-ink opacity-70">
                Free forever. No card, ever.
              </p>
            </div>

            <div data-hero-cast className="relative">
              <Sparkle
                size={26}
                color="var(--play-coral-deep)"
                className="twinkle absolute -left-1 top-2 hidden sm:block"
              />
              <Sparkle
                size={20}
                color="var(--primary)"
                className="twinkle absolute right-2 top-0 hidden sm:block"
                />
              <HeroLesson />
              {/* Standing clear of the card, not tucked behind it. Sitting it
                  behind meant most of the character was hidden, and putting it
                  in front covered the exchange the card exists to show — so it
                  gets its own ground below the card instead.
                  CSS sizing overrides the SVG's own width/height attributes. */}
              <Ayo
                size={132}
                className="bob pointer-events-none absolute -bottom-14 right-2 z-20 h-[92px] w-[92px] lg:-bottom-16 lg:-left-16 lg:right-auto lg:h-[132px] lg:w-[132px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Boards ───────────────────────────────────────────────────── */}
      <section className="border-y-[3px] border-ink bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
          <ExamBadgeRow />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              How a session goes
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,5.5vw,3.25rem)] leading-[1.02]">
              Ten minutes. One idea. Proof.
            </h2>
          </div>
          <Kito size={96} className="bob-slow hidden shrink-0 sm:block" />
        </div>

        <div data-reveal-group className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="on-play ink-card p-6" style={{ background: s.bg }}>
              <span className="font-display text-[2.75rem] leading-none text-ink opacity-45">
                {s.n}
              </span>
              <h3 className="mt-3 font-display text-[1.6rem] leading-tight text-ink">{s.title}</h3>
              <p className="mt-2.5 text-[15px] font-medium leading-relaxed text-ink">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Subjects ─────────────────────────────────────────────────── */}
      <section className="on-play border-y-[3px] border-ink" style={{ background: 'var(--play-marigold)' }}>
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <div data-reveal>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink opacity-70">
              What you can study
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,5.5vw,3.25rem)] leading-[1.02] text-ink">
              Six subjects. Thirty topics.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] font-medium leading-relaxed text-ink">
              Practice written in the style of each board, so a WAEC theory question reads like one
              and a JAMB objective reads like one.
            </p>
          </div>

          <div data-reveal-group className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((s) => (
              <Link
                key={s.id}
                href="/signup"
                className="ink-card group block bg-play-card p-5 no-underline"
              >
                <span className="mb-4 inline-block">
                  <SubjectIcon icon={s.icon} accent={s.accent} size={52} tone="solid" />
                </span>
                <p className="font-display text-[1.5rem] leading-tight text-ink">{s.name}</p>
                <p className="mt-1.5 text-[14.5px] font-medium leading-relaxed text-ink-muted">
                  {s.blurb}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-ink">
                  {s.topics.length} topics
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Where it stops ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="on-play ink-card overflow-hidden" style={{ background: 'var(--play-coral)' }}>
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div data-reveal>
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink opacity-70">
                Where it stops
              </p>
              <h2 className="mt-3 font-display text-[clamp(1.9rem,5vw,3rem)] leading-[1.02] text-ink">
                Three things Ewin will not do.
              </h2>

              <ul className="mt-7 space-y-3">
                {NOTS.map((n) => (
                  <li
                    key={n}
                    className="ink-card-sm flex items-center gap-3 bg-play-card px-4 py-3.5 text-[15px] font-semibold text-ink"
                  >
                    <X className="h-4 w-4 shrink-0" style={{ color: 'var(--play-coral-deep)' }} />
                    {n}
                  </li>
                ))}
              </ul>

              <p className="mt-6 max-w-lg text-[15.5px] font-medium leading-relaxed text-ink">
                It makes you produce the answer yourself. That is the part that shows up in your
                score, and the only part worth paying for.
              </p>
            </div>

            <div data-reveal className="flex justify-center lg:justify-end">
              <Zuri size={200} className="bob" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section className="on-play border-y-[3px] border-ink" style={{ background: 'var(--play-mint)' }}>
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <div data-reveal>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink opacity-70">
              What it costs
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,5.5vw,3.25rem)] leading-[1.02] text-ink">
              Free covers real studying.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] font-medium leading-relaxed text-ink">
              Pro is for mock season — timed full papers and unlimited drills. Not sitting mocks
              yet? Stay on Free.
            </p>
          </div>

          <div data-reveal-group className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="ink-card bg-play-card p-6">
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                {free.name}
              </p>
              <p className="mt-3 font-display text-[2.5rem] leading-none">
                {formatNgn(0)}
                <span className="ml-2 text-[15px] font-medium text-ink-muted">forever</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {free.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px] font-medium text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-correct" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="ink-btn mt-7 block bg-play-card py-3.5 text-center text-[15px] font-bold text-ink no-underline"
              >
                Start free
              </Link>
            </div>

            <div className="on-play ink-card p-6" style={{ background: 'var(--play-marigold)' }}>
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink">
                {pro.name}
              </p>
              <p className="mt-3 font-display text-[2.5rem] leading-none text-ink">
                {formatNgn(pro.priceMonthlyNgn)}
                <span className="ml-2 text-[15px] font-medium text-ink opacity-70">/month</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {pro.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px] font-medium text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="ink-btn mt-7 block bg-primary py-3.5 text-center text-[15px] font-bold text-on-primary no-underline"
              >
                Go Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(2rem,5.5vw,3.25rem)] leading-[1.02]">
            Straight answers.
          </h2>
          <Kito size={80} className="bob hidden shrink-0 sm:block" />
        </div>

        <div data-reveal-group className="mt-8 max-w-3xl space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="ink-card group bg-surface p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="font-display text-[1.35rem] leading-snug text-ink">{f.q}</span>
                <span
                  aria-hidden
                  className="shrink-0 text-[1.6rem] leading-none text-ink transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-[15.5px] font-medium leading-relaxed text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Close ────────────────────────────────────────────────────── */}
      <section className="on-play border-t-[3px] border-ink" style={{ background: 'var(--play-marigold)' }}>
        <div className="mx-auto max-w-3xl px-5 py-16 text-center lg:py-24">
          <div data-reveal className="flex items-end justify-center gap-3">
            <Ayo size={92} className="bob" />
            <Zuri size={110} className="bob-slow" />
            <Kito size={92} className="bob" />
          </div>

          <h2
            data-reveal
            className="mt-8 font-display text-[clamp(2.1rem,7vw,3.5rem)] leading-[1.02] text-ink"
          >
            The exam is coming either way.
          </h2>
          <p data-reveal className="mx-auto mt-5 max-w-lg text-[16.5px] font-medium leading-relaxed text-ink">
            Ten honest minutes tonight beat three hours of cramming the week before. Pick one topic
            and find out what you actually know.
          </p>
          <Link
            data-reveal
            href="/signup"
            className="ink-btn mt-9 inline-flex items-center gap-2 bg-primary px-8 py-4 text-[16px] font-bold text-on-primary no-underline"
          >
            Start with one topic
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
