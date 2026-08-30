import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  MessageCircle,
  Target,
  GraduationCap,
  ShieldCheck,
  Smartphone,
  Check,
  TrendingUp,
  Flame,
  Clock,
} from 'lucide-react'
import { SUBJECTS } from './lib/subjects'
import { SiteHeader } from '@/components/SiteHeader'
import { EwinDemo } from '@/components/EwinDemo'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'One concept, not a chapter dump',
    body: 'Ewin teaches a single idea in plain language — then stops and checks you. No walls of notes you will never finish.',
  },
  {
    icon: MessageCircle,
    title: 'Answer in your own words',
    body: 'Not multiple-choice guessing. You explain it back. Ewin tells you what was right, what was off, and why.',
  },
  {
    icon: Target,
    title: 'Built for WAEC & JAMB',
    body: 'Nigerian syllabus language, local examples, and the kind of questions examiners actually set — not generic internet worksheets.',
  },
  {
    icon: Flame,
    title: 'Tracks your streak',
    body: 'Come back every day and Ewin remembers where you stopped. Consistency is what exam confidence is built on.',
  },
  {
    icon: Clock,
    title: 'Short by design',
    body: 'Sessions are 10–15 minutes. Enough to move forward — short enough to do daily, even in exam season.',
  },
  {
    icon: TrendingUp,
    title: 'Adapts to you',
    body: 'If you nail a concept fast, Ewin moves up. Struggling? It slows down and comes at it from a different angle.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Pick a subject & topic',
    body: 'Mathematics, Physics, Chemistry, Biology, English, or Economics — then choose where to start. No account needed.',
  },
  {
    n: '02',
    title: 'Learn, then prove it',
    body: 'Ewin explains one idea. You answer in your own words. Feedback is specific — not "good job" spam.',
  },
  {
    n: '03',
    title: 'Move only when it stuck',
    body: 'The next concept waits until this one is clear. That is how exam confidence is built.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Adaeze O.',
    detail: 'SS3 · Enugu',
    quote:
      'I used to just read my notes and hope for the best. Ewin made me actually explain things back — my Chemistry grade jumped from C6 to B2 in one term.',
  },
  {
    name: 'Tunde A.',
    detail: 'JAMB candidate · Lagos',
    quote:
      'The questions feel exactly like what JAMB sets. And the feedback tells you WHY you were wrong, not just that you were wrong. That difference is everything.',
  },
  {
    name: 'Ngozi E.',
    detail: 'SS2 · Abuja',
    quote:
      'My teacher moves too fast. Ewin lets me go at my own pace and ask as many stupid questions as I need to — without feeling embarrassed.',
  },
]

const FAQS = [
  {
    q: 'Is Ewin free?',
    a: 'Yes. You can start a full tutoring session with no account and no card. We may add optional Pro later for longer history and more subjects — the core loop stays free.',
  },
  {
    q: 'How is this different from ChatGPT?',
    a: 'ChatGPT will dump an essay if you ask. Ewin is constrained to teach one concept, ask one question, and give structured feedback — a tutor loop, not a search box.',
  },
  {
    q: 'Will it give me the answer in the exam?',
    a: 'No. Ewin is for learning. It uses a Socratic style so you reason, not copy. Use it to prepare — not to cheat.',
  },
  {
    q: 'Does it work on a low-end phone?',
    a: 'Yes. Ewin is a web app that runs in your browser — no download, no heavy data. Most sessions use less data than opening a WhatsApp voice note.',
  },
  {
    q: 'What if I stop for a few weeks?',
    a: "Come back anytime. Ewin picks up where you left off — your last topic is saved so you don't have to remember yourself.",
  },
]

export default function Home() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up">
            <p className="mb-4 text-xs font-mono uppercase tracking-[0.16em] text-accent">
              AI tutor · WAEC &amp; JAMB
            </p>
            <h1 className="font-serif text-[clamp(2.4rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-ink">
              Learn one idea.
              <br />
              Then prove you got it.
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-muted">
              Ewin is a patient AI tutor for Nigerian secondary students. Short explanations. Real
              questions. Feedback that actually teaches — not another chatbot that writes your notes
              for you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#subjects"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper no-underline transition-colors hover:bg-accent-hover"
              >
                Choose a subject
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink no-underline transition-colors hover:border-accent"
              >
                How it works
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                No signup · free to start
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                Works on any phone
              </span>
            </div>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
            <EwinDemo />
          </div>
        </div>
      </section>

      {/* ── Subjects strip ── */}
      <section className="border-y border-line bg-white/60">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-5 sm:px-6">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Covers
          </span>
          {SUBJECTS.map((s) => (
            <Link
              key={s.id}
              href={`/learn/${s.id}`}
              className="text-[13px] text-ink-muted no-underline transition-colors hover:text-ink"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { v: '6', l: 'Core subjects' },
            { v: '1', l: 'Concept at a time' },
            { v: '₦0', l: 'To start' },
            { v: '100%', l: 'Socratic method' },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-serif text-3xl font-semibold text-accent sm:text-4xl">{s.v}</p>
              <p className="mt-1 text-sm leading-snug text-ink-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-line bg-white/60">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Why Ewin</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Built like a tutor. Not a search bar.
          </h2>
          <p className="mt-2 max-w-lg text-sm text-ink-muted">
            Most AI tools will write the essay for you. Ewin is deliberately slower — because that
            is how understanding is built.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_0_var(--line)]"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
                  <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                </div>
                <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subjects grid ── */}
      <section id="subjects" className="scroll-mt-16 border-t border-line">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Subjects
              </h2>
              <p className="mt-1 text-sm text-ink-muted">Pick one. Choose a topic. Begin.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((s) => (
              <Link
                key={s.id}
                href={`/learn/${s.id}`}
                className="group rounded-2xl border border-line bg-white p-5 no-underline transition-colors hover:border-accent"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
                    {s.exam}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-[16px] font-semibold text-ink">{s.name}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{s.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.topics.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] text-ink-muted"
                    >
                      {t}
                    </span>
                  ))}
                  {s.topics.length > 3 && (
                    <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] text-ink-muted">
                      +{s.topics.length - 3} more
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="scroll-mt-16 border-t border-line bg-white/60">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">How it works</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Three steps. No complicated setup.
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
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

      {/* ── Why Ewin exists ── */}
      <section className="border-t border-line bg-ink">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <TrendingUp className="mx-auto h-6 w-6 text-white/30" aria-hidden="true" />
          <p className="mx-auto mt-6 max-w-2xl font-serif text-2xl leading-snug text-white sm:text-3xl">
            Built by a Nigerian developer who sat the same exams — because rereading a textbook the
            night before never actually worked.
          </p>
          <p className="mt-6 text-sm text-white/40">— The Ewin Academy team</p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Students</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            What they say
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-line bg-white p-6 shadow-[0_1px_0_var(--line)]"
              >
                <p className="text-[14px] leading-relaxed text-ink">"{t.quote}"</p>
                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-[13px] font-semibold text-ink">{t.name}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="border-t border-line bg-white/60">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-center font-mono text-xs uppercase tracking-widest text-accent">
            Pricing
          </p>
          <h2 className="mt-3 text-center font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Start free. Upgrade only if you need more.
          </h2>
          <div className="mx-auto mt-10 grid max-w-2xl gap-5 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border border-line bg-white p-8">
              <h3 className="font-semibold text-ink">Free</h3>
              <p className="mt-1 font-serif text-3xl text-ink">₦0</p>
              <ul className="mt-6 space-y-3">
                {[
                  'All 6 subjects',
                  'Unlimited sessions',
                  'Socratic feedback',
                  'No account needed',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="#subjects"
                className="mt-8 block rounded-full border border-line px-4 py-2.5 text-center text-sm font-medium text-ink no-underline transition-colors hover:border-accent"
              >
                Start for free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border-2 border-accent bg-accent-soft p-8">
              <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-paper">
                Coming soon
              </span>
              <h3 className="font-semibold text-ink">Pro</h3>
              <p className="mt-1 font-serif text-3xl text-ink">
                ₦1,500{' '}
                <span className="text-base font-sans font-normal text-ink-muted">/month</span>
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Everything in Free',
                  'Session history & progress',
                  'More subjects & topics',
                  'Streak & performance tracking',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="mt-8 block w-full cursor-not-allowed rounded-full bg-accent px-4 py-2.5 text-center text-sm font-medium text-paper opacity-50"
              >
                Notify me
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-center font-mono text-xs uppercase tracking-widest text-accent">FAQ</p>
          <h2 className="mt-3 text-center font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Common questions
          </h2>
          <div className="mt-10 divide-y divide-line">
            {FAQS.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="text-[15px] font-semibold text-ink">{f.q}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-line bg-white/60">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <GraduationCap className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
          <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Exam day rewards what you practiced.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
            Ten focused minutes with Ewin beats three hours of passive rereading.
          </p>
          <Link
            href="#subjects"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-paper no-underline transition-colors hover:bg-accent-hover"
          >
            Start with a subject
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-4 text-xs text-ink-muted">No signup · free forever</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-[11px] font-bold text-paper">
                E
              </span>
              <span className="text-[14px] font-semibold text-ink">Ewin</span>
            </div>
            <p className="text-center text-xs text-ink-muted sm:text-right">
              Built by Ewin Academy · not affiliated with WAEC, JAMB, or NECO
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
