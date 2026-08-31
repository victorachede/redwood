import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  MessageCircle,
  Target,
  GraduationCap,
} from 'lucide-react'
import { SUBJECTS } from './lib/subjects'
import { SiteHeader } from '@/components/SiteHeader'
import { InteractiveHeroDemo } from '@/components/InteractiveHeroDemo'
import { HomeHeroCTAs, HomeBottomCTA } from '@/components/HomeCTAs'
import { ExamBadgeRow } from '@/components/ExamBadges'

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
    n: '1',
    title: 'Choose a subject',
    body: 'Maths, Physics, Chemistry, Biology, English, or Economics.',
  },
  {
    n: '2',
    title: 'Read, then answer',
    body: 'Ewin explains. You reply in the box. You get clear feedback.',
  },
  {
    n: '3',
    title: 'Or try practice questions',
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

export default function Home() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader />

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div
            className="absolute left-1/2 top-0 h-[420px] w-[min(100%,720px)] -translate-x-1/2 rounded-full opacity-70"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(201,162,39,0.12) 0%, transparent 68%)',
            }}
          />
        </div>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
              AI tutor · WAEC & JAMB
            </p>
            <h1 className="font-serif text-[clamp(2.25rem,5vw,3.35rem)] font-semibold leading-[1.12] tracking-tight text-ink">
              Learn one idea.
              <br />
              Then prove you got it.
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-muted">
              Free help for secondary school. Ewin teaches a little, asks you a question, and checks
              your answer — so you understand before exam day.
            </p>
            <HomeHeroCTAs />
            <div className="mt-6">
              <p className="mb-2 text-[11px] uppercase tracking-wider text-ink-muted">Practice for</p>
              <ExamBadgeRow />
            </div>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '90ms' }}>
            <InteractiveHeroDemo />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
          {[
            { v: '6', l: 'Core subjects' },
            { v: '1', l: 'Concept at a time' },
            { v: '₦0', l: 'To start' },
            { v: 'Socratic', l: 'Not answer keys' },
          ].map((s) => (
            <div key={s.l} className="text-center sm:text-left">
              <p className="font-serif text-2xl font-semibold text-ink">{s.v}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          How Ewin helps you
        </h2>
        <p className="mt-2 max-w-lg text-sm text-ink-muted">
          Not a site that dumps notes. A tutor that checks you understood.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_0_var(--line)]"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="border-t border-line bg-white scroll-mt-16">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Subjects
              </h2>
              <p className="mt-1 text-sm text-ink-muted">Tap a subject to start learning.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((s) => (
              <Link
                key={s.id}
                href={`/learn/${s.id}`}
                className="group rounded-2xl border border-line bg-paper p-5 no-underline transition-colors hover:border-accent"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
                    {s.exam}
                  </span>
                  <ArrowRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
                <h3 className="text-[16px] font-semibold text-ink">{s.name}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{s.blurb}</p>
                <p className="mt-3 text-[11px] text-ink-muted">
                  Learn with tutor · or practice questions
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="scroll-mt-16 border-t border-line">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Three simple steps
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <p className="font-mono text-xs text-accent">{step.n}</p>
                <h3 className="mt-2 text-[15px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="border-t border-line">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Free to start. Pro when you need mocks.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
            Timed JAMB / WAEC / NECO practice and unlimited drills are on Pro. Checkout via Paystack when you are ready.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper no-underline hover:bg-accent-hover"
          >
            See pricing
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-white">
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
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <GraduationCap className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Ready when you are
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
            Even 10 minutes a day helps more than cramming the night before.
          </p>
          <HomeBottomCTA />
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-ink-muted">
        <p>Ewin · not affiliated with WAEC, JAMB, or NECO</p>
        <p className="mt-1">Built for students who want understanding, not shortcuts.</p>
      </footer>
    </main>
  )
}
