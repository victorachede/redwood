'use client'

import Link from 'next/link'
import { Mark } from '@/components/Mark'
import { useAuthCta } from '@/components/useAuthCta'

/**
 * Header for the marketing and legal pages.
 *
 * The wordmark text is set in Sora here rather than through the shared
 * <Wordmark>, which stays in Instrument Serif for the app shell and auth
 * screens — this header is marketing-only, and the landing page rebuild is
 * what moved to Sora, not the whole product.
 */
export function SiteHeader() {
  const cta = useAuthCta('/signup')

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Mark size={28} />
          <span className="font-marketing text-[19px] font-bold leading-none tracking-tight text-ink">
            EWIN
          </span>
        </Link>

        <nav className="ml-8 hidden items-center gap-7 font-marketing text-[14px] font-medium text-ink-muted lg:flex">
          <Link href="/#subjects" className="no-underline hover:text-ink">
            Subjects
          </Link>
          <Link href="/#how-it-works" className="no-underline hover:text-ink">
            How it works
          </Link>
          <Link href="/pricing" className="no-underline hover:text-ink">
            Pricing
          </Link>
        </nav>

        <div className="flex-1" />

        {/* There was no way in from the marketing pages at all — only "Start
            free", which reads as a signup and left returning students with
            nowhere to click. Log in is a link rather than a second button so
            it does not compete with the primary action. Hidden entirely once
            useAuthCta knows there's already a session — "Log in" to someone
            already logged in is just wrong, not merely redundant. */}
        {!cta.signedIn && (
          <Link
            href="/login"
            className="hidden px-3 py-2 font-marketing text-[14.5px] font-bold text-ink no-underline hover:underline sm:inline-block"
          >
            Log in
          </Link>
        )}
        <Link
          href={cta.href}
          className="press inline-flex items-center rounded-full bg-ink px-5 py-2.5 font-marketing text-[14px] font-bold text-on-dark no-underline"
        >
          {cta.signedIn ? 'Go to dashboard' : 'Sign up free'}
        </Link>
      </div>
    </header>
  )
}
