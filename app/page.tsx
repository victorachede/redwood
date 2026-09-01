import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  MessageCircle,
  Target,
  GraduationCap,
  Check,
  Sparkles,
  Zap,
  Shield,
} from 'lucide-react'
import { SUBJECTS } from './lib/subjects'
import { SiteHeader } from '@/components/SiteHeader'
import { InteractiveHeroDemo } from '@/components/InteractiveHeroDemo'
import { HomeHeroCTAs, HomeBottomCTA } from '@/components/HomeCTAs'
import { ExamBadgeRow } from '@/components/ExamBadges'
import { SiteFooter } from '@/components/SiteFooter'
import { formatNgn, PLANS } from '@/app/lib/billing'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Small lessons',
    body: 'Ewin teaches one idea at a time — short and clear — then asks if you understood. No long notes to scroll past.',
  },
  {
    icon: MessageCircle,
    title: 'You type the answer',
    body: 'Write it in your own words. Ewin tells you what was right, what was wrong, and why.',
  },
  {
    icon: Target,
    title: 'For WAEC & JAMB',
    body: 'Subjects and questions in the style of the exams you will actually sit — with Nigerian examples.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Choose a subject',
    body: 'Maths, Physics, Chemistry, Biology, English, or Economics.',
  },
  {
    n: '02',
    title: 'Read, then answer',
    body: 'Ewin explains. You reply in the box. You get clear feedback.',
  },
  {
    n: '03',
    title: 'Or try practice',
    body: 'Multiple-choice past-style questions — then see the explanation.',
  },
]

const FAQS = [
  {
    q: 'Is Ewin free?',
    a: 'Yes. Free covers tutor sessions, study cards, and practice across JAMB, WAEC and NECO style questions. Pro adds timed mocks and unlimited drills — paid via Paystack.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Tap a subject and start. Sign up only if you want your name on the dashboard — still free.',
  },
  {
    q: 'JAMB, WAEC or NECO — which does it cover?',
    a: 'All three. In practice you pick a board filter. Questions are written in that exam’s style. Ewin is not affiliated with the boards; materials are for learning only.',
  },
  {
    q: 'Is this for cheating in the exam?',
    a: 'No. Use Ewin to prepare at home. In the exam hall you work on your own.',
  },
]

const SUBJECT_ACCENTS: Record<string, string> = {
  mathematics: 'from-amber-500/20 to-transparent',
  physics: 'from-sky-500/20 to-transparent',
  chemistry: 'from-violet-500/20 to-transparent',
  biology: 'from-emerald-500/20 to-transparent',
  english: 'from-rose-500/20 to-transparent',
  economics: 'from-teal-500/20 to-transparent',
}

export default function Home() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 mesh-grid opacity-60" />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[min(100%,800px)] -translate-x-1/2 rounded-full opacity-80"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(201,162,39,0.16) 0%, transparent 68%)',
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-fade-up">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-[var(--paper-elevated)]/80 px-3 py-1 text-[11px] font-medium text-ink-muted backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                AI tutor · Built for Nigerian secondary school
              </div>
              <h1 className="font-serif text-[clamp(2.35rem,5.2vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-ink">
                Learn one idea.
                <br />
                <span className="gold-text">Then prove you got it.</span>
              </h1>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-muted">
                Free help for secondary school. Ewin teaches a little, asks you a question, and
                checks your answer — so you understand before exam day.
              </p>
              <HomeHeroCTAs />
              <div className="mt-7">
                <p className="mb-2.5 text-[11px] uppercase tracking-wider text-ink-muted">
                  Practice for
                </p>
                <ExamBadgeRow />
              </div>
            </div>

            <div className="animate-fade-up animate-float" style={{ animationDelay: '90ms' }}>
              <InteractiveHeroDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-[var(--paper-card)]/80">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-9 sm:grid-cols-4 sm:px-6">
          {[
            { v: '6', l: 'Core subjects' },
            { v: '1', l: 'Concept at a time' },
            { v: '₦0', l: 'To start' },
            { v: 'Socratic', l: 'Not answer keys' },
          ].map((s) => (
            <div key={s.l} className="text-center sm:text-left">
              <p className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {s.v}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features — bento */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">How it works</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Study that actually sticks
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
            Not another PDF dump. A tutor that forces you to think — then shows you where you were
            right or wrong.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="surface-card group rounded-2xl p-5 transition hover:border-[var(--line-strong)]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent transition group-hover:scale-105">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-line bg-[var(--paper-card)]/50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Three steps. No fluff.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <p className="font-mono text-[11px] font-semibold tracking-widest text-accent">
                  {s.n}
                </p>
                <h3 className="mt-2 text-[16px] font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="scroll-mt-20 mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Subjects</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Pick where to start
            </h2>
          </div>
          <p className="max-w-xs text-[13px] text-ink-muted">
            Tutor mode or practice questions — same subjects, different muscle.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <Link
              key={s.id}
              href={`/learn/${s.id}`}
              className="surface-card group relative overflow-hidden rounded-2xl p-5 no-underline transition hover:border-accent/40 hover:surface-glow"
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${SUBJECT_ACCENTS[s.id] ?? 'from-accent/10 to-transparent'} opacity-60`}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[16px] font-semibold text-ink group-hover:text-accent">
                    {s.name}
                  </h3>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-accent" />
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  {s.exam}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{s.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.topics.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-line/80 bg-paper/40 px-2 py-0.5 text-[10px] text-ink-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/practice/mathematics"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-accent no-underline hover:underline"
          >
            Jump to practice questions
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-ink">Built for exam prep, not shortcuts</p>
              <p className="mt-1 max-w-md text-[13px] text-ink-muted">
                Ewin checks understanding. Use it at home. In the hall, you work alone.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-ink-muted">
            <Zap className="h-4 w-4 text-accent" />
            Paystack for Pro · No foreign card required
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="scroll-mt-16 mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Pricing</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Free to start. Pro when you need mocks.
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="surface-card rounded-2xl p-6">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-ink-muted">
              {PLANS.free.name}
            </p>
            <p className="mt-2 font-serif text-3xl font-semibold text-ink">
              {formatNgn(PLANS.free.priceMonthlyNgn)}
              <span className="text-base font-normal text-ink-muted">/mo</span>
            </p>
            <p className="mt-1 text-sm text-ink-muted">{PLANS.free.blurb}</p>
            <ul className="mt-5 space-y-2">
              {PLANS.free.features.slice(0, 4).map((f) => (
                <li key={f} className="flex gap-2 text-[13px] text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="#subjects"
              className="mt-6 inline-flex w-full justify-center rounded-full border border-line bg-[var(--paper-elevated)] py-2.5 text-sm font-medium text-ink no-underline hover:border-accent"
            >
              Start free
            </Link>
          </div>

          <div className="surface-card surface-glow relative rounded-2xl p-6">
            <span className="absolute right-4 top-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper">
              Popular
            </span>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
              {PLANS.pro.name}
            </p>
            <p className="mt-2 font-serif text-3xl font-semibold text-ink">
              {formatNgn(PLANS.pro.priceMonthlyNgn)}
              <span className="text-base font-normal text-ink-muted">/mo</span>
            </p>
            <p className="mt-1 text-sm text-ink-muted">{PLANS.pro.blurb}</p>
            <ul className="mt-5 space-y-2">
              {PLANS.pro.features.slice(0, 4).map((f) => (
                <li key={f} className="flex gap-2 text-[13px] text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="mt-6 inline-flex w-full justify-center rounded-full bg-accent py-2.5 text-sm font-semibold text-paper no-underline hover:bg-accent-hover"
            >
              Upgrade with Paystack
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-[12px] text-ink-muted">
          <Link href="/pricing" className="text-accent no-underline hover:underline">
            Full plan comparison →
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-[var(--paper-card)]/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">Questions</h2>
          <div className="mt-8 divide-y divide-line">
            {FAQS.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="text-[15px] font-semibold text-ink">{f.q}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line">
        <div className="relative mx-auto max-w-5xl overflow-hidden px-4 py-16 text-center sm:px-6 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(201,162,39,0.12) 0%, transparent 65%)',
            }}
          />
          <GraduationCap className="relative mx-auto h-9 w-9 text-accent" />
          <h2 className="relative mt-4 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Ready when you are
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-ink-muted">
            Even 10 minutes a day helps more than cramming the night before.
          </p>
          <div className="relative">
            <HomeBottomCTA />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
