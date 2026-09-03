import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader />
      <section className="relative overflow-hidden border-b border-line bg-sunken">
        <div className="absolute inset-x-0 bottom-0 h-px" />
        <div className="mx-auto max-w-2xl px-5 py-14 sm:px-6 sm:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Legal
          </p>
          <h1 className="mt-3 font-display text-[clamp(1.875rem,3.4vw,2.5rem)]">
            Terms of use
          </h1>
          <p className="mt-3 inline-flex rounded-full border border-line bg-surface px-3 py-1 text-[12px] text-ink-muted">
            Last updated: August 2026
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-2xl px-5 py-14 sm:px-6">
        <div className="prose-ewin space-y-5">
          <p>
            Ewin is an AI study tool for secondary-school exam preparation (WAEC, NECO, JAMB). By
            using the service you agree to these terms.
          </p>
          <h2 className="font-display text-[1.15rem] text-ink">Not the exam boards</h2>
          <p>
            Ewin is not affiliated with, endorsed by, or connected to WAEC, NECO, or JAMB. Practice
            questions are for learning only. Do not use Ewin inside an exam hall.
          </p>
          <h2 className="font-display text-[1.15rem] text-ink">Accounts &amp; billing</h2>
          <p>
            Free features are available without payment. Pro features are billed through Paystack.
            You are responsible for the accuracy of the payment email you provide.
          </p>
          <h2 className="font-display text-[1.15rem] text-ink">Acceptable use</h2>
          <p>
            Do not abuse the tutor with spam, harassment, or attempts to extract answer keys for
            live examinations. We may suspend accounts that break this rule.
          </p>
          <h2 className="font-display text-[1.15rem] text-ink">Contact</h2>
          <p>
            Questions about these terms:{" "}
            <a href="mailto:support@ewin.academy" className="text-primary">
              support@ewin.academy
            </a>
            .
          </p>
        </div>
        <p className="mt-10 text-sm">
          <Link href="/" className="text-primary no-underline hover:underline">
            ← Home
          </Link>
        </p>
      </article>
      <SiteFooter />
    </main>
  )
}
