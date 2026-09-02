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
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-7 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
          <RefreshCw className="h-6 w-6 text-primary" />
        </span>
        <h1 className="font-display text-[20px] text-ink">Something broke on our side</h1>
        <p className="mx-auto mt-2.5 max-w-xs text-[14px] leading-relaxed text-ink-muted">
          Not your fault. Try again — and if it keeps happening, tell us on Discord.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="press rounded-full bg-primary py-3.5 text-[15px] font-medium text-on-primary"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="press rounded-full border border-line py-3.5 text-[15px] font-medium text-ink no-underline"
          >
            Back to Today
          </Link>
        </div>
        {error.digest && (
          <p className="mt-4 font-mono text-[11px] text-ink-faint">ref {error.digest}</p>
        )}
      </div>
    </main>
  )
}
