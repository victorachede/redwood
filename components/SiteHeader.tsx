'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

/** Header for the marketing and legal pages. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image src="/logo-mark.png" alt="" width={28} height={28} className="h-7 w-7 rounded-lg" />
          <span className="font-display text-[17px] text-ink">Ewin</span>
        </Link>
        <div className="flex-1" />
        <ThemeToggle />
        <Link
          href="/dashboard"
          className="press rounded-full bg-primary px-4 py-2 text-[13.5px] font-medium text-on-primary no-underline"
        >
          Start
        </Link>
      </div>
    </header>
  )
}
