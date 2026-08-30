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
]

const STEPS = [
  {
    n: '01',
    title: 'Pick a subject & topic',
    body: 'Mathematics, Physics, Chemistry, Biology, English, or Economics — then choose where to start.',
  },
  {
    n: '02',
    title: 'Learn, then prove it',
    body: 'Ewin explains. You answer. Feedback is specific — not “good job” spam.',
  },
  {
    n: '03',
    title: 'Move only when it stuck',
    body: 'The next concept waits until this one is clear. That is how exam confidence is built.',
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
]

export default function Home() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
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
              Ewin is a patient tutor for Nigerian secondary students. Short explanations. Real
              questions. Feedback that actually teaches — not another chatbot that writes your notes
              for you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#subjects"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper no-underline transition-colors hover:bg-accent-hover"
              >
                Choose a subject
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink no-underline hover:border-accent"
              >
                Dashboard
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-muted">No signup required · Free to start</p>
          </div>

          {/* Hero card — session preview */}
          <div
            className="animate-fade-up rounded-2xl border border-line bg-white p-6 shadow-[0_1px_0_var(--line),0_20px_40px_-24px_rgba(22,21,19,0.25)]"
            style={{ animationDelay: '80ms' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
                Mathematics · Algebra
              </span>
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                Live session
              </span>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-line bg-paper/80 p-3.5">
                <p className="text-[11px] font-medium text-ink-muted mb-1">Ewin</p>
                <p className="text-sm leading-relaxed text-ink">
                  A linear equation is like a balanced scale. Whatever you do to one side, you must
                  do to the other — so the equality stays true.
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-accent">
                  Question
                </p>
                <p className="text-sm font-medium text-ink">
                  If 2x + 3 = 11, what is x? Explain your steps.
                </p>
              </div>
              <div className="ml-8 rounded-xl bg-accent p-3.5 text-sm text-paper">
                I subtract 3 from both sides, get 2x = 8, then divide by 2. So x = 4.
              </div>
              <div className="rounded-xl border border-line bg-paper/80 p-3.5">
                <p className="text-[11px] font-medium text-ink-muted mb-1">Ewin</p>
                <p className="text-sm leading-relaxed text-ink">
                  Exactly — order of operations on the equation is correct. Next we will try one with
                  a negative coefficient…
                </p>
              </div>
            </div>
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
          Built like a tutor. Not a search bar.
        </h2>
        <p className="mt-2 max-w-lg text-sm text-ink-muted">
          Most AI tools will write the essay for you. Ewin is deliberately slower — because that is
          how understanding is built.
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
              <p className="mt-1 text-sm text-ink-muted">Pick one. Choose a topic. Begin.</p>
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
                  {s.topics.length} topic paths · tutor + practice
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
            How a session works
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
            Exam day rewards what you practiced.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
            Ten focused minutes with Ewin beats three hours of passive rereading.
          </p>
          <Link
            href="#subjects"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-paper no-underline hover:bg-accent-hover"
          >
            Start with a subject
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-ink-muted">
        <p>Ewin · not affiliated with WAEC, JAMB, or NECO</p>
        <p className="mt-1">Built for students who want understanding, not shortcuts.</p>
      </footer>
    </main>
  )
}
