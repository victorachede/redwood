'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { getSession, refreshSession, signOut, useAuthListener, type LocalUser } from '@/app/lib/auth'

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pricing', label: 'Pricing' },
]

export function SiteHeader({
  solid = false,
  overDark = false,
}: {
  solid?: boolean
  /** Header sits on a dark hero until the user scrolls. */
  overDark?: boolean
}) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setUser(getSession())
    void refreshSession().then((u) => setUser(u ?? getSession()))
    return useAuthListener(() => setUser(getSession()))
  }, [])

  useEffect(() => {
    if (!overDark) return
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overDark])

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Light text while sitting on the dark hero, ink once scrolled past it
  const onDark = overDark && !scrolled

  const shell = solid
    ? 'bg-paper border-b border-line'
    : onDark
      ? 'bg-transparent border-b border-transparent'
      : 'bg-paper/85 backdrop-blur-md border-b border-line shadow-[var(--shadow-xs)]'

  const linkBase = onDark
    ? 'text-[var(--on-accent-muted)] hover:text-white'
    : 'text-ink-muted hover:text-ink'

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${shell}`}
      data-over-dark={onDark ? 'true' : 'false'}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5 no-underline">
          <span className="relative inline-flex">
            <Image
              src="/logo-mark.png"
              alt="Ewin"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </span>
          <span
            className={`text-[15px] font-semibold tracking-tight transition-colors ${
              onDark ? 'text-white' : 'text-ink'
            }`}
          >
            Ewin
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-7 text-[13px] sm:flex">
            {NAV.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 no-underline transition-colors ${
                    active ? (onDark ? 'text-white' : 'text-ink') : linkBase
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gold-500 transition-transform duration-300 ${
                      active ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                <Link
                  href="/settings"
                  className={`max-w-[8rem] truncate text-[13px] no-underline transition-colors ${
                    onDark ? 'text-white/90 hover:text-white' : 'text-ink hover:text-ink-muted'
                  }`}
                >
                  {user.displayName}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    signOut()
                    setUser(null)
                  }}
                  className={`text-[13px] transition-colors ${linkBase}`}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`text-[13px] no-underline transition-colors ${linkBase}`}>
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="sheen rounded-lg bg-gradient-to-br from-[#16274d] to-[#0e1b3a] px-4 py-2 text-[13px] font-medium text-[var(--on-accent)] no-underline shadow-[var(--shadow-md)] transition-transform duration-200 hover:scale-[1.02] active:scale-100"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile trigger — the nav was previously unreachable below sm */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={`-mr-2 flex h-9 w-9 items-center justify-center rounded-lg transition-colors sm:hidden ${
              onDark ? 'text-white/80 hover:bg-white/10' : 'text-ink-muted hover:bg-neutral-100'
            }`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="animate-fade-up border-t border-line bg-paper/95 backdrop-blur-md sm:hidden">
          <nav className="mx-auto flex max-w-5xl flex-col px-5 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2 py-2.5 text-[14px] text-ink no-underline transition-colors hover:bg-neutral-100"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-2 flex items-center gap-2 border-t border-line pt-3">
              {user ? (
                <>
                  <Link
                    href="/settings"
                    className="flex-1 rounded-lg px-2 py-2.5 text-[14px] text-ink no-underline hover:bg-neutral-100"
                  >
                    {user.displayName}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      signOut()
                      setUser(null)
                      setMenuOpen(false)
                    }}
                    className="rounded-lg px-3 py-2.5 text-[14px] text-ink-muted hover:bg-neutral-100"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex-1 rounded-lg border border-line px-3 py-2.5 text-center text-[14px] text-ink no-underline"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 rounded-lg bg-gradient-to-br from-[#16274d] to-[#0e1b3a] px-3 py-2.5 text-center text-[14px] font-medium text-[var(--on-accent)] no-underline"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
