'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('page error', error)
  }, [error])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-5 text-ink">
      <div className="relative w-full max-w-md overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-navy-700 to-navy-900 px-7 py-10 text-center shadow-[var(--shadow-lg)]">
        <div className="absolute inset-x-0 top-0 h-px" />

        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-streak/30 bg-streak/10">
          <RefreshCw className="h-6 w-6 text-streak" />
        </span>

        <h1 className="font-serif text-xl font-semibold text-white">Something broke on our side</h1>
        <p className="mx-auto mt-3 max-w-xs text-[13.5px] leading-relaxed text-ink-muted">
          This is not your fault. Try again — if it keeps happening, let us know on Discord.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 px-5 py-2.5 text-[14px] font-semibold text-primary shadow-[var(--shadow-md)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-white/15 bg-surface/[0.07] px-5 py-2.5 text-[14px] font-medium text-white no-underline transition-colors hover:bg-surface/[0.13]"
          >
            Back home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-5 font-mono text-[11px] text-white/30">ref {error.digest}</p>
        )}
      </div>
    </main>
  )
}
