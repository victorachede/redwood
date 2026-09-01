'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Settings, Menu, X } from 'lucide-react'
import { getSession, signOut, useAuthListener, type LocalUser } from '@/app/lib/auth'

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setUser(getSession())
    return useAuthListener(() => setUser(getSession()))
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`sticky top-0 z-40 border-b border-line/80 ${
        solid ? 'bg-paper' : 'bg-paper/80 backdrop-blur-xl'
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

        <nav className="hidden items-center gap-1 text-[13px] text-ink-muted sm:flex">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-1.5 no-underline hover:bg-accent-soft hover:text-ink"
          >
            Dashboard
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg px-3 py-1.5 no-underline hover:bg-accent-soft hover:text-ink"
          >
            Pricing
          </Link>
          <Link
            href="/#subjects"
            className="rounded-lg px-3 py-1.5 no-underline hover:bg-accent-soft hover:text-ink"
          >
            Subjects
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              <Link
                href="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-accent-soft hover:text-ink"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <Link
                href="/settings"
                className="hidden max-w-[7rem] truncate px-1 text-[13px] text-ink no-underline hover:text-accent sm:inline"
              >
                {user.displayName}
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut()
                  setUser(null)
                }}
                className="rounded-full border border-line bg-[var(--paper-elevated)] px-3 py-1.5 text-[12px] font-medium text-ink hover:border-accent"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden px-3 py-1.5 text-[13px] text-ink-muted no-underline hover:text-ink sm:inline"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-semibold text-paper no-underline hover:bg-accent-hover"
              >
                Sign up
              </Link>
            </>
          )}

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-accent-soft hover:text-ink sm:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-xl sm:hidden">
          <div className="flex flex-col gap-1 text-[14px]">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-ink no-underline hover:bg-accent-soft"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-ink no-underline hover:bg-accent-soft"
            >
              Pricing
            </Link>
            <Link
              href="/#subjects"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-ink no-underline hover:bg-accent-soft"
            >
              Subjects
            </Link>
            {!user && (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-ink no-underline hover:bg-accent-soft"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
