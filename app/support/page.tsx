import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function SupportPage() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />
      <section className="relative overflow-hidden border-b border-line bg-paper-sunken">
        <div className="hairline-gold absolute inset-x-0 bottom-0 h-px" />
        <div className="mx-auto max-w-2xl px-5 py-14 sm:px-6 sm:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600">
            Help
          </p>
          <h1 className="mt-3 font-serif text-[clamp(1.875rem,3.4vw,2.5rem)] font-semibold tracking-[-0.025em]">
            Support
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Stuck on a lesson, billing, or a bug? Reach us through any of these channels — we
            actually reply.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-6">
        <ul className="mt-8 space-y-4 text-sm">
          <li className="lift rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-sm)]">
            <p className="font-semibold">Discord</p>
            <p className="mt-1 text-ink-muted">Fastest for students — ask in #help.</p>
            <a
              href="https://discord.gg/ewin"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block font-medium text-navy-700 no-underline hover:underline"
            >
              Join the server →
            </a>
          </li>
          <li className="lift rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-sm)]">
            <p className="font-semibold">Email</p>
            <p className="mt-1 text-ink-muted">For account and payment issues.</p>
            <a href="mailto:support@ewin.academy" className="mt-3 inline-block font-medium text-navy-700 no-underline hover:underline">
              support@ewin.academy
            </a>
          </li>
        </ul>
        <p className="mt-10 text-sm">
          <Link href="/" className="text-accent no-underline hover:underline">
            ← Home
          </Link>
        </p>
      </div>
      <SiteFooter />
    </main>
  )
}
