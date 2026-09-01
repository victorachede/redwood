'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import { getSession, refreshSession, signOut, useAuthListener, type LocalUser } from '@/app/lib/auth'

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [user, setUser] = useState<LocalUser | null>(null)

  useEffect(() => {
    setUser(getSession())
    void refreshSession().then((u) => setUser(u ?? getSession()))
    return useAuthListener(() => setUser(getSession()))
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b border-line ${
        solid ? 'bg-paper' : 'bg-paper/90 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
          <Image
            src="/logo-mark.png"
            alt="Ewin"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className="text-[15px] font-semibold tracking-tight text-ink">Ewin</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-end gap-0.5 text-[13px] text-ink-muted sm:gap-1">
          <Link
            href="/dashboard"
            className="rounded-lg px-2 py-1.5 no-underline hover:bg-accent-soft hover:text-ink sm:px-3"
          >
            Dashboard
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg px-2 py-1.5 no-underline hover:bg-accent-soft hover:text-ink sm:px-3"
          >
            Pricing
          </Link>
          <Link
            href="/#subjects"
            className="hidden rounded-lg px-2 py-1.5 no-underline hover:bg-accent-soft hover:text-ink sm:inline sm:px-3"
          >
            Subjects
          </Link>

          {user ? (
            <>
              <Link
                href="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-accent-soft hover:text-ink"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut()
                  setUser(null)
                }}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink hover:border-accent"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-2 py-1.5 no-underline hover:text-ink sm:px-3"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="ml-0.5 rounded-full bg-accent px-3 py-1.5 text-[12px] font-semibold text-[var(--on-accent)] no-underline hover:bg-accent-hover sm:ml-1 sm:px-3.5"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
