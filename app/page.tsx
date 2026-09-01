import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { SUBJECTS } from './lib/subjects'
import { SiteHeader } from '@/components/SiteHeader'
import { InteractiveHeroDemo } from '@/components/InteractiveHeroDemo'
import { HomeHeroCTAs, HomeBottomCTA } from '@/components/HomeCTAs'
import { ExamBadgeRow } from '@/components/ExamBadges'
import { SiteFooter } from '@/components/SiteFooter'
import { formatNgn, PLANS } from '@/app/lib/billing'

const FEATURES = [
  {
    title: 'One idea at a time',
    body: 'Short explanations. No walls of notes. Ewin stops and checks you understood before moving on.',
  },
  {
    title: 'You write the answer',
    body: 'Type it in your own words. Feedback tells you what held up and what did not — and why.',
  },
  {
    title: 'Exam-shaped practice',
    body: 'Questions in the style of WAEC, NECO and JAMB, with examples that feel familiar.',
  },
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
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <h1 className="mt-3 font-serif text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.15] tracking-tight text-ink">
              Learn one idea.
              <br />
              Then prove you got it.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-muted">
              Ewin teaches a little, asks a question, and checks your answer — so you understand
              before exam day.
            </p>
            <HomeHeroCTAs />
            <div className="mt-8">
              <p className="mb-2.5 text-[12px] text-ink-muted">Built around</p>
              <ExamBadgeRow />
            </div>
          </div>
          <div>
            <InteractiveHeroDemo />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
          Study that sticks
        </h2>
        <p className="mt-2 max-w-lg text-[15px] text-ink-muted">
          Not another PDF dump. A tutor that makes you think, then shows where you were right or wrong.
        </p>
        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <h3 className="text-[15px] font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="scroll-mt-20 mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">Subjects</h2>
            <p className="mt-1 text-[14px] text-ink-muted">Tutor or practice — same subjects.</p>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <Link
              key={s.id}
              href={`/learn/${s.id}`}
              className="group flex flex-col rounded-lg border border-line bg-white p-5 no-underline transition hover:border-neutral-400"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-semibold text-ink">{s.name}</h3>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-muted">{s.exam}</p>
              <p className="mt-3 flex-1 text-[13px] leading-relaxed text-ink-muted">{s.blurb}</p>
            </Link>
          ))}
        </div>

        <p className="mt-6">
          <Link
            href="/practice/mathematics"
            className="text-[13px] font-medium text-ink no-underline hover:underline"
          >
            Jump to practice questions →
          </Link>
        </p>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-16 border-t border-line bg-white">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">Pricing</h2>
          <p className="mt-1 text-[14px] text-ink-muted">Free to start. Pro when you need mocks.</p>

          <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line p-6">
              <p className="text-[13px] font-medium text-ink-muted">{PLANS.free.name}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                {formatNgn(PLANS.free.priceMonthlyNgn)}
                <span className="text-sm font-normal text-ink-muted">/mo</span>
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">{PLANS.free.blurb}</p>
              <ul className="mt-5 space-y-2">
                {PLANS.free.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2 text-[13px] text-ink">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="#subjects"
                className="mt-6 inline-flex w-full justify-center rounded-md border border-line py-2.5 text-sm font-medium text-ink no-underline hover:bg-neutral-50"
              >
                Start free
              </Link>
            </div>

            <div className="rounded-lg border-2 border-accent p-6">
              <p className="text-[13px] font-medium" style={{ color: 'var(--brand)' }}>{PLANS.pro.name}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                {formatNgn(PLANS.pro.priceMonthlyNgn)}
                <span className="text-sm font-normal text-ink-muted">/mo</span>
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">{PLANS.pro.blurb}</p>
              <ul className="mt-5 space-y-2">
                {PLANS.pro.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2 text-[13px] text-ink">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="mt-6 inline-flex w-full justify-center rounded-md bg-accent py-2.5 text-sm font-medium text-[var(--on-accent)] no-underline hover:bg-accent-hover"
              >
                Upgrade with Paystack
              </Link>
            </div>
          </div>
          <p className="mt-6 text-[13px] text-ink-muted">
            <Link href="/pricing" className="text-ink no-underline hover:underline">
              Full plan comparison →
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">Questions</h2>
          <div className="mt-8 divide-y divide-line">
            {FAQS.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="text-[15px] font-medium text-ink">{f.q}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Close */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
            Ready when you are
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[14px] text-ink-muted">
            Ten focused minutes beat a late-night cram.
          </p>
          <HomeBottomCTA />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
