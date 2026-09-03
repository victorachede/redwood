import Link from 'next/link'
import { Mark } from '@/components/Mark'

export const metadata = { title: 'Offline' }

/**
 * Shown when a page is requested with no connection and nothing cached.
 *
 * It names what still works rather than just apologising — cards and practice
 * are on the device, so a student who lost signal on the bus can still do
 * something useful with the next ten minutes.
 */
export default function Offline() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-5 text-center text-ink">
      <Mark size={44} />
      <h1 className="mt-7 font-display text-[clamp(1.75rem,7vw,2.5rem)] leading-tight">
        No connection.
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-[15.5px] leading-relaxed text-ink-muted">
        The lesson needs a signal, but your cards and practice questions are saved on this
        phone — those still work.
      </p>
      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <Link
          href="/cards"
          className="press rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-on-primary no-underline"
        >
          Review cards
        </Link>
        <Link
          href="/practice/mathematics"
          className="press rounded-full border border-line-strong bg-surface px-6 py-3.5 text-[15px] font-semibold text-ink no-underline"
        >
          Practice offline
        </Link>
      </div>
      <p className="mt-7 text-[13px] text-ink-faint">
        Anything you do now syncs when you are back on.
      </p>
    </main>
  )
}
