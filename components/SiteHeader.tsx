'use client'

import Link from 'next/link'
import { Wordmark } from '@/components/Mark'

/** Header for the marketing and legal pages. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 lg:px-8">
        <Link href="/" className="no-underline">
          <Wordmark size={28} />
        </Link>
        <div className="flex-1" />

        {/* There was no way in from the marketing pages at all — only "Start
            free", which reads as a signup and left returning students with
            nowhere to click. Log in is a link rather than a second button so
            it does not compete with the primary action. */}
        <Link
          href="/login"
          className="hidden px-3 py-2 text-[14.5px] font-bold text-ink no-underline hover:underline sm:inline-block"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="btn btn-primary press px-5 py-2.5 text-[14px] no-underline"
        >
          Sign up free
        </Link>
      </div>
    </header>
  )
}
