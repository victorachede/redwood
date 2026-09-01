import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, MessageSquareText, PenLine, Target } from 'lucide-react'
import { SUBJECTS } from './lib/subjects'
import { SiteHeader } from '@/components/SiteHeader'
import { HeroShowcase } from '@/components/HeroShowcase'
import { HomeHeroCTAs, HomeBottomCTA } from '@/components/HomeCTAs'
import { ExamBadgeRow } from '@/components/ExamBadges'
import { SiteFooter } from '@/components/SiteFooter'
import { Reveal } from '@/components/Reveal'
import { Stagger } from '@/components/Stagger'
import { Counter } from '@/components/Counter'
import { SubjectIcon } from '@/components/SubjectIcon'
import { formatNgn, PLANS } from '@/app/lib/billing'

const FEATURES = [
  {
    title: 'One idea at a time',
    body: 'Short explanations. No walls of notes. Ewin stops and checks you understood before moving on.',
    Icon: MessageSquareText,
  },
  {
    title: 'You write the answer',
    body: 'Type it in your own words. Feedback tells you what held up and what did not — and why.',
    Icon: PenLine,
  },
  {
    title: 'Exam-shaped practice',
    body: 'Questions in the style of WAEC, NECO and JAMB, with examples that feel familiar.',
    Icon: Target,
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Pick a subject and topic',
    body: 'Six subjects, thirty topics. Start anywhere — Ewin meets you at whatever you already know.',
  },
  {
    n: '02',
    title: 'Learn one idea, then answer',
    body: 'A short explanation, then a question. You type the answer in your own words, not a multiple choice guess.',
  },
  {
    n: '03',
    title: 'Get told exactly what was wrong',
    body: 'Not "good try". Ewin names the part that held up and the part that did not, then sets classwork when you are ready.',
  },
]

const STATS = [
  { value: 6, label: 'Subjects', suffix: '' },
  { value: 30, label: 'Topics', suffix: '' },
  { value: 37, label: 'Practice questions', suffix: '' },
  { value: 3, label: 'Exam boards', suffix: '' },
]

const FAQS = [
  {
    q: 'Is Ewin free?',
    a: 'Yes. Free covers tutor sessions, study cards, and practice. Pro adds timed mocks and unlimited drills — paid via Paystack.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Open a subject and start. Sign up only if you want your progress named on the dashboard.',
  },
  {
    q: 'Which exams?',
    a: 'JAMB, WAEC and NECO style. Ewin is not affiliated with the boards; materials are for learning only.',
  },
  {
    q: 'Is this for cheating?',
    a: 'No. Use it to prepare at home. In the exam hall you work on your own.',
  },
]

export default function Home() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader overDark />

      {/* ═══ Hero ══════════════════════════════════════════════════════════ */}
      {/* -mt-16 pulls the band up under the sticky header (sticky occupies
          layout, so without this the header would sit on cream above the
          navy and its light-on-dark text would vanish). pt-16 restores the
          content offset. */}
      <section className="aurora noise relative -mt-16 overflow-hidden bg-navy-800">
        {/* Gold hairline sealing the band */}
        <div className="hairline-gold absolute inset-x-0 bottom-0 h-px" />

        <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-32">
          {/* items-start, never items-center: a height change in one column
              must never be able to move the other. */}
          <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <Reveal>
                <span className="ring-gradient inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-medium tracking-wide text-[var(--on-accent-muted)] backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                  Built for WAEC · NECO · JAMB
                </span>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="mt-6 font-serif text-[clamp(2.5rem,5.6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
                  Learn one idea.
                  <br />
                  <span className="text-gold-gradient">Then prove you got it.</span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-6 max-w-md text-[16px] leading-[1.65] text-[var(--on-accent-muted)]">
                  Ewin teaches a little, asks a question, and checks your answer — so you
                  understand before exam day.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <HomeHeroCTAs />
              </Reveal>

              <Reveal delay={320}>
                <div className="mt-10">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-accent-muted)]">
                    Built around
                  </p>
                  <ExamBadgeRow variant="dark" />
                </div>
              </Reveal>
            </div>

            <Reveal delay={200} variant="scale">
              <HeroShowcase />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ Proof strip ═══════════════════════════════════════════════════ */}
      <section className="border-b border-line bg-paper-sunken">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal
                key={s.label}
                delay={i * 70}
                className={`text-center ${i > 0 ? 'sm:border-l sm:border-line' : ''}`}
              >
                <p className="font-serif text-4xl font-semibold tracking-tight text-navy-700">
                  <Counter value={s.value} className="tnum" />
                </p>
                <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                  {s.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600">
            Why it works
          </p>
          <h2 className="mt-3 font-serif text-[clamp(1.875rem,3.2vw,2.5rem)] font-semibold tracking-[-0.025em] text-ink">
            Study that sticks
          </h2>
          <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-ink-muted">
            Not another PDF dump. A tutor that makes you think, then shows where you were right
            or wrong.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-3" step={90}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="lift group h-full rounded-2xl border border-line bg-white p-6 shadow-[var(--shadow-sm)]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700/[0.07] transition-colors group-hover:bg-navy-700/[0.11]">
                <f.Icon className="h-5 w-5 text-navy-700" strokeWidth={1.9} />
              </span>
              <h3 className="mt-5 text-[16px] font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{f.body}</p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* ═══ How it works — dark band ══════════════════════════════════════ */}
      <section className="aurora noise relative overflow-hidden bg-navy-800">
        <div className="hairline-gold absolute inset-x-0 top-0 h-px" />
        <div className="relative mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">
              How it works
            </p>
            <h2 className="mt-3 max-w-xl font-serif text-[clamp(1.875rem,3.2vw,2.5rem)] font-semibold tracking-[-0.025em] text-white">
              Three steps, then you are studying
            </h2>
          </Reveal>

          <Stagger className="mt-14 grid gap-10 sm:grid-cols-3" step={100}>
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <span className="font-serif text-3xl font-semibold text-gold-500/70">{s.n}</span>
                <div className="hairline-gold my-4 h-px w-full opacity-40" />
                <h3 className="text-[16px] font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--on-accent-muted)]">
                  {s.body}
                </p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══ Subjects ══════════════════════════════════════════════════════ */}
      <section id="subjects" className="scroll-mt-20 bg-paper-sunken">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600">
                  What you can study
                </p>
                <h2 className="mt-3 font-serif text-[clamp(1.875rem,3.2vw,2.5rem)] font-semibold tracking-[-0.025em] text-ink">
                  Subjects
                </h2>
                <p className="mt-2 text-[15px] text-ink-muted">
                  Six subjects · thirty topics · tutor or practice, your call.
                </p>
              </div>
            </div>
          </Reveal>

          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" step={65}>
            {SUBJECTS.map((s) => (
              <Link
                key={s.id}
                href={`/learn/${s.id}`}
                className="lift group flex h-full flex-col rounded-2xl border border-line bg-white p-5 no-underline shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <SubjectIcon icon={s.icon} accent={s.accent} size={42} />
                  <ArrowRight
                    className="mt-1 h-4 w-4 shrink-0 text-ink-subtle transition-all duration-300 group-hover:translate-x-1"
                    style={{ color: s.accent }}
                  />
                </div>

                <h3 className="mt-4 text-[16px] font-semibold text-ink">{s.name}</h3>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-subtle">
                  {s.exam}
                </p>
                <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-muted">
                  {s.blurb}
                </p>

                <span
                  className="mt-4 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{
                    background: `color-mix(in srgb, ${s.accent} 10%, transparent)`,
                    color: s.accent,
                  }}
                >
                  {s.topics.length} topics
                </span>
              </Link>
            ))}
          </Stagger>

          <Reveal delay={120}>
            <p className="mt-8">
              <Link
                href="/practice/mathematics"
                className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-navy-700 no-underline"
              >
                Jump straight to practice questions
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ Pricing ═══════════════════════════════════════════════════════ */}
      <section id="pricing" className="scroll-mt-16 bg-paper">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600">
              Pricing
            </p>
            <h2 className="mt-3 font-serif text-[clamp(1.875rem,3.2vw,2.5rem)] font-semibold tracking-[-0.025em] text-ink">
              Free to start
            </h2>
            <p className="mt-2 text-[15px] text-ink-muted">Pro when you need timed mocks.</p>
          </Reveal>

          <div className="mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
            <Reveal>
              <div className="lift h-full rounded-2xl border border-line bg-white p-7 shadow-[var(--shadow-sm)]">
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  {PLANS.free.name}
                </p>
                <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink">
                  {formatNgn(PLANS.free.priceMonthlyNgn)}
                  <span className="ml-1 text-base font-normal text-ink-muted">/mo</span>
                </p>
                <p className="mt-2 text-[13.5px] text-ink-muted">{PLANS.free.blurb}</p>
                <ul className="mt-6 space-y-2.5">
                  {PLANS.free.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13.5px] text-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="#subjects"
                  className="mt-7 inline-flex w-full justify-center rounded-xl border border-line py-3 text-[14px] font-medium text-ink no-underline transition-colors hover:bg-paper-sunken"
                >
                  Start free
                </Link>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="ring-gradient lift relative h-full rounded-2xl bg-white p-7 shadow-[var(--shadow-gold)]">
                <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-navy-800">
                  Most popular
                </span>
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-gold-600">
                  {PLANS.pro.name}
                </p>
                <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink">
                  {formatNgn(PLANS.pro.priceMonthlyNgn)}
                  <span className="ml-1 text-base font-normal text-ink-muted">/mo</span>
                </p>
                <p className="mt-2 text-[13.5px] text-ink-muted">{PLANS.pro.blurb}</p>
                <ul className="mt-6 space-y-2.5">
                  {PLANS.pro.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13.5px] text-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className="sheen mt-7 inline-flex w-full justify-center rounded-xl bg-gradient-to-br from-[#16274d] to-[#0e1b3a] py-3 text-[14px] font-medium text-[var(--on-accent)] no-underline shadow-[var(--shadow-md)]"
                >
                  {PLANS.pro.cta}
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={140}>
            <p className="mt-8">
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-navy-700 no-underline"
              >
                Full plan comparison
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ FAQ ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-line bg-paper-sunken">
        <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <h2 className="font-serif text-[clamp(1.875rem,3.2vw,2.5rem)] font-semibold tracking-[-0.025em] text-ink">
              Questions
            </h2>
          </Reveal>

          <Stagger className="mt-10 space-y-3" step={60}>
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-line bg-white px-5 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-sm)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="pb-5 text-[14px] leading-relaxed text-ink-muted">{f.a}</p>
              </details>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══ Close ═════════════════════════════════════════════════════════ */}
      <section className="aurora noise relative overflow-hidden bg-navy-800">
        <div className="hairline-gold absolute inset-x-0 top-0 h-px" />
        <div className="relative mx-auto max-w-5xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <Reveal>
            <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] text-white">
              Ready when you are
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-[var(--on-accent-muted)]">
              Ten focused minutes beat a late-night cram.
            </p>
            <HomeBottomCTA />
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
