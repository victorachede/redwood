import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />
      <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-2 text-[13px] text-ink-muted">Last updated: August 2026</p>
        <div className="mt-8 space-y-5 text-[14px] leading-relaxed text-ink-muted">
          <p>
            We collect the minimum needed to run Ewin: account email and display name if you sign
            up, lesson progress on your device, and payment references if you upgrade via Paystack.
          </p>
          <p>
            Tutor messages are sent to our AI provider to generate replies. Do not paste sensitive
            personal data into the chat.
          </p>
          <p>
            When Supabase is connected, progress may sync to our servers so you can continue on
            another device. You can request deletion by emailing support.
          </p>
          <p>
            Contact:{" "}
            <a href="mailto:support@ewin.academy" className="text-accent">
              support@ewin.academy
            </a>
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
