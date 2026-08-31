import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function SupportPage() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Support</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed">
          Stuck on a lesson, billing, or a bug? Reach us through any of these channels — we actually
          reply.
        </p>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="rounded-2xl border border-line bg-[var(--paper-elevated)] p-5">
            <p className="font-semibold">Discord</p>
            <p className="mt-1 text-ink-muted">Fastest for students — ask in #help.</p>
            <a
              href="https://discord.gg/ewin"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-accent no-underline hover:underline"
            >
              Join the server →
            </a>
          </li>
          <li className="rounded-2xl border border-line bg-[var(--paper-elevated)] p-5">
            <p className="font-semibold">Email</p>
            <p className="mt-1 text-ink-muted">For account and payment issues.</p>
            <a href="mailto:support@ewin.academy" className="mt-3 inline-block text-accent no-underline hover:underline">
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
