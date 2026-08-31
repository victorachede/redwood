'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
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
        <Link href="/" className="flex items-center gap-2.5 no-underline">
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
        <nav className="flex items-center gap-1.5 sm:gap-2 text-[13px] text-ink-muted">
          <Link href="/dashboard" className="hidden px-2 hover:text-ink no-underline sm:inline">
            Dashboard
          </Link>
          <Link href="/pricing" className="hidden px-2 hover:text-ink no-underline sm:inline">
            Pricing
          </Link>
          {user ? (
            <>
              <Link
                href="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white hover:text-ink"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <Link
                href="/settings"
                className="hidden max-w-[7rem] truncate px-1 text-ink no-underline hover:text-accent sm:inline"
              >
                {user.displayName}
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
              <Link href="/login" className="px-2 hover:text-ink no-underline">
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
