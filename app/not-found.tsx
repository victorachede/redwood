import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteFooter } from '@/components/SiteFooter'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-paper text-ink">
      <section className="relative flex flex-1 items-center overflow-hidden bg-primary">
        <div className="absolute inset-x-0 bottom-0 h-px" />

        <div className="relative mx-auto w-full max-w-2xl px-5 py-24 text-center sm:px-8">
          <p className="font-serif text-[clamp(4.5rem,14vw,8rem)] font-semibold leading-none tracking-[-0.04em]">
            404
          </p>

          <h1 className="mt-4 font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.02em] text-white">
            That page is not in the syllabus
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-ink-muted">
            The link may be old or mistyped. Everything you can study is one tap away.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 px-6 py-3 text-[14px] font-semibold text-primary no-underline shadow-[var(--shadow-md)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-xl border border-white/15 bg-surface/[0.07] px-6 py-3 text-[14px] font-medium text-white no-underline backdrop-blur-sm transition-colors hover:bg-surface/[0.13]"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
