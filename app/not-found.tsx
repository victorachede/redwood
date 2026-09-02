import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-paper text-ink">
      <SiteHeader />

      <section className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center">
        <p className="font-display text-[clamp(3.5rem,18vw,5.5rem)] leading-none text-primary opacity-30">
          404
        </p>
        <h1 className="mt-3 font-display text-[24px] text-ink">
          That page is not in the syllabus
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-ink-muted">
          The link may be old or mistyped. Everything you can study is one tap away.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="press rounded-full bg-primary px-6 py-3.5 text-[15px] font-medium text-on-primary no-underline"
          >
            Go to Today
          </Link>
          <Link
            href="/"
            className="press rounded-full border border-line bg-surface px-6 py-3.5 text-[15px] font-medium text-ink no-underline"
          >
            Back home
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
