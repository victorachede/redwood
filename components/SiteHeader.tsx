'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
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
        solid ? 'bg-paper' : 'bg-paper/95 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image
            src="/logo-mark.png"
            alt="Ewin"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            priority
          />
          <span className="text-[15px] font-medium tracking-tight text-ink">Ewin</span>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 text-[13px] text-ink-muted sm:flex">
            <Link href="/dashboard" className="no-underline hover:text-ink">
              Dashboard
            </Link>
            <Link href="/pricing" className="no-underline hover:text-ink">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/settings"
                  className="hidden max-w-[8rem] truncate text-[13px] text-ink no-underline hover:text-ink-muted sm:inline"
                >
                  {user.displayName}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    signOut()
                    setUser(null)
                  }}
                  className="text-[13px] text-ink-muted hover:text-ink"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[13px] text-ink-muted no-underline hover:text-ink"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-ink px-3.5 py-2 text-[13px] font-medium text-white no-underline hover:bg-accent-hover"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
