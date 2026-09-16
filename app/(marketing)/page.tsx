import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'
import { SUBJECTS } from '@/app/lib/subjects'
import { SubjectIcon } from '@/components/SubjectIcon'
import { ExamBadgeRow } from '@/components/ExamBadges'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { formatNgn, PLANS } from '@/app/lib/billing'
import { Motion } from '@/components/marketing/Motion'

/**
 * The landing page.
 *
 * The audience is sitting WAEC, NECO or JAMB — exams that decide whether
 * they get into university. That is not a children's errand, and this page
 * used to read like one: flat candy-coloured blocks, a thick ink outline on
 * every card, and three cartoon characters carrying the argument for it.
 * None of that is what makes a 17-year-old trust a study tool with their
 * result.
 *
 * What replaces it: one calm paper canvas, a hairline and a soft shadow for
 * elevation instead of a comic-panel border, colour spent in small doses
 * where it already means something (a subject's own accent, correct/wrong),
 * and the argument carried by real sentences and a working demo rather than
 * decoration. What it keeps from the version underneath even that: real
 * sentences rather than slogans, no invented statistics, and no testimonials
 * from students who do not exist yet.
 */

const STEPS = [
  {
    n: '01',
    title: 'One idea. Not a chapter.',
    body:
      'A few sentences, plain English, with an example you have actually seen — naira, danfo fares, a market scale. Then it stops and waits for you.',
  },
  {
    n: '02',
    title: 'Then it makes you answer.',
    body:
      'Typed out, in your own words. Guessing a letter is how you find out in the exam hall that you never really knew it — and by then it is too late.',
  },
  {
    n: '03',
    title: 'And it names what broke.',
    body:
      'Not "good try". The exact step that went wrong, why it went wrong, and the same question again until it holds.',
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

      {/* ── Hero ─────────────────────────────────────────────────────────
          Rogue take: not a SaaS hero at all. Ewin's actual promise is "you
          write the answer, it gets marked, you find out what broke" — so
          the hero doesn't describe that, it shows the artifact that promise
          produces: a script marked in red biro, the way every one of these
          students has gotten work back their whole school life. No stock
          photo, no chat-demo card, no mascot. Dark ink ground so the paper
          card reads as an object sitting on a desk, not a UI panel. */}
      <section className="relative overflow-hidden bg-ink">
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <div>
              <p data-hero-item className="text-[13px] font-bold uppercase tracking-[0.16em] text-on-hero-dim">
                Free &nbsp;·&nbsp; WAEC &nbsp;·&nbsp; NECO &nbsp;·&nbsp; JAMB
              </p>

              <h1
                data-hero-item
                className="mt-5 font-display text-[clamp(2.5rem,6vw,4rem)] leading-[1.02] text-on-primary"
              >
                Answer it like the
                <br />
                exam hall.
                <br />
                Get marked like one.
              </h1>

              <p data-hero-item className="mt-6 max-w-md text-[16.5px] font-medium leading-relaxed text-on-hero-dim">
                Ewin doesn&rsquo;t just explain a topic. It makes you write the answer, marks it
                like a real script, and shows you exactly where the marks were lost.
              </p>

              <div data-hero-item className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link
                  href="/signup"
                  className="press inline-flex items-center justify-center gap-2 rounded-full bg-on-primary px-7 py-4 text-[16px] font-bold text-primary no-underline transition-opacity hover:opacity-90"
                >
                  Start learning — free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="text-[15px] font-bold text-on-primary no-underline hover:underline"
                >
                  See pricing
                </Link>
              </div>
            </div>

            {/* The marked script. */}
            <div data-hero-cast className="relative mx-auto w-full max-w-[360px]">
              <div className="rotate-[-2.5deg] rounded-[3px] bg-[#fffdf8] p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-dashed border-ink/15 pb-3.5">
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                      WAEC · Mathematics
                    </p>
                    <p className="mt-0.5 text-[14px] font-semibold text-ink">Paper 2 — Question 4</p>
                  </div>
                  <div className="flex gap-[3px]" aria-hidden>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} className="h-4 w-3 border border-ink/20" />
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-ink">
                  <p className="flex items-start gap-2.5">
                    <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-wrong" strokeWidth={3} />
                    3x &minus; 5 = 10
                  </p>
                  <p className="flex items-start gap-2.5">
                    <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-wrong" strokeWidth={3} />
                    3x = 15
                  </p>
                  <p className="flex items-start gap-2.5">
                    <X className="mt-[3px] h-3.5 w-3.5 shrink-0 text-wrong" strokeWidth={3} />
                    <span>
                      x = 3{' '}
                      <span className="ml-1 -rotate-3 font-semibold text-wrong">↗ x = 5</span>
                    </span>
                  </p>
                </div>

                <p className="mt-4 -rotate-1 text-[12px] font-semibold italic leading-snug text-wrong">
                  Arithmetic slip — divide both sides by 3 again.
                </p>

                <div className="mt-5 border-t border-dashed border-ink/15 pt-3 text-[11px] font-medium text-ink-faint">
                  Marked and returned the same session.
                </div>
              </div>

              {/* Score, circled — overlapping the card corner. */}
              <div
                className="absolute -right-4 -top-6 flex h-[72px] w-[72px] rotate-[10deg] items-center justify-center rounded-full border-[3px] border-wrong bg-ink"
                aria-hidden
              >
                <span className="font-display text-[1.65rem] leading-none text-wrong">7/10</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Boards ───────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
          <ExamBadgeRow />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
        <div data-reveal>
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
            How a session goes
          </p>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.02]">
            Ten minutes. One idea. Proof.
          </h2>
        </div>

        <div data-reveal-group className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t-2 border-rule pt-5">
              <span className="font-display text-[2.5rem] leading-none text-rule">{s.n}</span>
              <h3 className="mt-3 font-display text-[1.5rem] leading-tight text-ink">{s.title}</h3>
              <p className="mt-2.5 text-[15px] font-medium leading-relaxed text-ink-muted">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Subjects ─────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-sunken">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
          <div data-reveal>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              What you can study
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.02] text-ink">
              Six subjects. Thirty topics.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] font-medium leading-relaxed text-ink-muted">
              Practice written in the style of each board, so a WAEC theory question reads like one
              and a JAMB objective reads like one.
            </p>
          </div>

          <div data-reveal-group className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((s) => (
              <Link
                key={s.id}
                href="/signup"
                className="card card-interactive group block p-5 no-underline"
              >
                <span className="mb-4 inline-block">
                  <SubjectIcon icon={s.icon} accent={s.accent} size={48} tone="solid" />
                </span>
                <p className="font-display text-[1.4rem] leading-tight text-ink">{s.name}</p>
                <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-ink-muted">
                  {s.blurb}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-ink-faint">
                  {s.topics.length} topics
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Where it stops ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
        <div data-reveal className="card card-lg mx-auto max-w-2xl p-8 sm:p-10">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
            Where it stops
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,4.6vw,2.5rem)] leading-[1.05] text-ink">
            Three things Ewin will not do.
          </h2>

          <ul className="mt-7 space-y-2.5">
            {NOTS.map((n) => (
              <li
                key={n}
                className="flex items-center gap-3 rounded-xl bg-wrong-soft px-4 py-3.5 text-[15px] font-semibold text-ink"
              >
                <X className="h-4 w-4 shrink-0 text-wrong" />
                {n}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[15px] font-medium leading-relaxed text-ink-muted">
            It makes you produce the answer yourself. That is the part that shows up in your
            score, and the only part worth paying for.
          </p>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-sunken">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
          <div data-reveal>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              What it costs
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.02] text-ink">
              Free covers real studying.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] font-medium leading-relaxed text-ink-muted">
              Pro is for mock season — timed full papers and unlimited drills. Not sitting mocks
              yet? Stay on Free.
            </p>
          </div>

          <div data-reveal-group className="mt-12 grid gap-5 sm:grid-cols-2">
            <div className="card p-7">
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                {free.name}
              </p>
              <p className="mt-3 font-display text-[2.25rem] leading-none text-ink">
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
                className="btn btn-secondary press mt-7 block py-3.5 text-center text-[15px] no-underline"
              >
                Start free
              </Link>
            </div>

            <div className="card card-elevated relative border-primary p-7">
              <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-on-primary">
                For mock season
              </span>
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                {pro.name}
              </p>
              <p className="mt-3 font-display text-[2.25rem] leading-none text-ink">
                {formatNgn(pro.priceMonthlyNgn)}
                <span className="ml-2 text-[15px] font-medium text-ink-muted">/month</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {pro.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px] font-medium text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-correct" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="btn btn-primary press mt-7 block py-3.5 text-center text-[15px] no-underline"
              >
                Go Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
        <div data-reveal>
          <h2 className="font-display text-[clamp(2rem,5vw,3rem)] leading-[1.02]">Straight answers.</h2>
        </div>

        <div data-reveal-group className="mt-8 max-w-3xl space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="font-display text-[1.3rem] leading-snug text-ink">{f.q}</span>
                <span
                  aria-hidden
                  className="shrink-0 text-[1.6rem] leading-none text-ink-faint transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-[15px] font-medium leading-relaxed text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Close ────────────────────────────────────────────────────── */}
      <section className="bg-primary">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:py-28">
          <p data-reveal className="text-[13px] font-bold uppercase tracking-[0.14em] text-on-hero-dim">
            Before the exam, not the night before
          </p>
          <h2
            data-reveal
            className="mt-4 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.02] text-on-primary"
          >
            The exam is coming either way.
          </h2>
          <p data-reveal className="mx-auto mt-5 max-w-lg text-[16px] font-medium leading-relaxed text-on-hero-dim">
            Ten honest minutes tonight beat three hours of cramming the week before. Pick one topic
            and find out what you actually know.
          </p>
          <Link
            data-reveal
            href="/signup"
            className="btn btn-ghost-on-dark press mt-9 inline-flex px-8 py-4 text-[16px] no-underline"
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
