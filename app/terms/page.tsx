import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />
      <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6 prose-sm">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Terms of use</h1>
        <p className="mt-2 text-[13px] text-ink-muted">Last updated: August 2026</p>
        <div className="mt-8 space-y-5 text-[14px] leading-relaxed text-ink-muted">
          <p>
            Ewin is an AI study tool for secondary-school exam preparation (WAEC, NECO, JAMB). By
            using the service you agree to these terms.
          </p>
          <h2 className="text-[15px] font-semibold text-ink">Not the exam boards</h2>
          <p>
            Ewin is not affiliated with, endorsed by, or connected to WAEC, NECO, or JAMB. Practice
            questions are for learning only. Do not use Ewin inside an exam hall.
          </p>
          <h2 className="text-[15px] font-semibold text-ink">Accounts &amp; billing</h2>
          <p>
            Free features are available without payment. Pro features are billed through Paystack.
            You are responsible for the accuracy of the payment email you provide.
          </p>
          <h2 className="text-[15px] font-semibold text-ink">Acceptable use</h2>
          <p>
            Do not abuse the tutor with spam, harassment, or attempts to extract answer keys for
            live examinations. We may suspend accounts that break this rule.
          </p>
          <h2 className="text-[15px] font-semibold text-ink">Contact</h2>
          <p>
            Questions about these terms:{" "}
            <a href="mailto:support@ewin.academy" className="text-accent">
              support@ewin.academy
            </a>
            .
          </p>
        </div>
        <p className="mt-10 text-sm">
          <Link href="/" className="text-accent no-underline hover:underline">
            ← Home
          </Link>
        </p>
      </article>
      <SiteFooter />
    </main>
  )
}
