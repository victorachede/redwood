'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Wordmark } from '@/components/Mark'

/**
 * Header for the marketing and legal pages.
 *
 * Wider than the old 3xl cap because the page below it is no longer a phone
 * column stretched across a desktop — the header has to line up with the
 * ruled margin, not float in the middle of it.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 lg:px-8">
        <Link href="/" className="no-underline">
          <Wordmark size={26} />
        </Link>
        <div className="flex-1" />
        <ThemeToggle />
        <Link
          href="/dashboard"
          className="press rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-on-primary no-underline"
        >
          Start free
        </Link>
      </div>
    </header>
  )
}
