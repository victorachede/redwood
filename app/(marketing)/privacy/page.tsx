import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function PrivacyPage() {
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
            Privacy
          </h1>
          
        </div>
      </section>

      <article className="mx-auto max-w-2xl px-5 py-14 sm:px-6">
        <div className="prose-ewin">
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
            <a href="mailto:support@ewin.academy" className="text-primary">
              support@ewin.academy
            </a>
          </p>
        </div>
        <p className="mt-10 text-sm">
          <Link href="/" className="text-primary no-underline hover:underline">
            ← Home
          </Link>
        </p>
        </div>
      </article>
      <SiteFooter />
    </main>
  )
}
