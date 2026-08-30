'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSession, signOut, useAuthListener, type LocalUser } from '@/app/lib/auth'

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [user, setUser] = useState<LocalUser | null>(null)

  useEffect(() => {
    setUser(getSession())
    return useAuthListener(() => setUser(getSession()))
  }, [])

  return (
    <header
      className={`sticky top-0 z-30 border-b border-line ${
        solid ? 'bg-paper' : 'bg-paper/90 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[13px] font-bold text-paper">
            E
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">Ewin</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3 text-[13px] text-ink-muted">
          <Link href="/dashboard" className="hidden sm:inline hover:text-ink no-underline">
            Dashboard
          </Link>
          {user ? (
            <>
              <span className="hidden max-w-[8rem] truncate text-ink sm:inline">
                {user.displayName}
              </span>
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
              <Link href="/login" className="hover:text-ink no-underline px-2">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-medium text-paper no-underline hover:bg-accent-hover transition-colors"
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
