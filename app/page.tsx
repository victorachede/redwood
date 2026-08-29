import Link from 'next/link'
import { SUBJECTS } from './lib/subjects'

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(61,214,140,0.14), transparent 55%)',
        }}
      />

      <header className="sticky top-0 z-20 border-b border-[var(--border)]/80 bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              E
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Ewin</span>
          </Link>
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
            WAEC · JAMB
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <section className="animate-fade-up mb-12 text-center sm:mb-14">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Free AI tutor · Nigeria
          </p>
          <h1 className="mx-auto max-w-xl text-[clamp(1.85rem,5vw,2.75rem)] font-semibold leading-[1.12] tracking-tight text-[var(--text)]">
            Learn one concept.
            <br />
            <span className="text-[var(--accent)]">Prove you got it.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[var(--text-secondary)]">
            Ewin teaches a small idea, then asks you a question. No dumps of notes. No guessing
            through past papers alone — built for secondary students who need clarity.
          </p>
        </section>

        <section className="animate-fade-up mb-10" style={{ animationDelay: '80ms' }}>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Choose a subject
            </h2>
            <span className="text-[12px] text-[var(--text-muted)]">{SUBJECTS.length} available</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SUBJECTS.map((s, i) => (
              <Link
                key={s.id}
                href={`/learn/${s.id}`}
                className="group relative flex items-start gap-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 no-underline transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)]"
                style={{ animationDelay: `${100 + i * 40}ms` }}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{
                    background: `${s.accent}18`,
                    color: s.accent,
                    border: `1px solid ${s.accent}33`,
                  }}
                >
                  {s.icon}
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
                      {s.name}
                    </span>
                    <span
                      className="text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
                      aria-hidden
                    >
                      →
                    </span>
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug text-[var(--text-secondary)]">
                    {s.blurb}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section
          className="animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:p-6"
          style={{ animationDelay: '160ms' }}
        >
          <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            How a session works
          </h3>
          <ol className="space-y-3">
            {[
              { n: '01', t: 'Ewin explains one idea', d: 'Short, clear — not a textbook chapter.' },
              { n: '02', t: 'You answer in your words', d: 'A real check, not multiple-choice luck.' },
              {
                n: '03',
                t: 'Feedback, then the next step',
                d: 'What was right, what to fix, then move on.',
              },
            ].map((step) => (
              <li key={step.n} className="flex gap-3.5">
                <span className="font-mono text-[12px] font-medium text-[var(--accent)] pt-0.5">
                  {step.n}
                </span>
                <span>
                  <span className="block text-[14px] font-medium text-[var(--text)]">{step.t}</span>
                  <span className="block text-[13px] text-[var(--text-secondary)]">{step.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="border-t border-[var(--border)] py-6 text-center text-[12px] text-[var(--text-muted)]">
        Ewin · free for secondary students · not affiliated with WAEC or JAMB
      </footer>
    </main>
  )
}
