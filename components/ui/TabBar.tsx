'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Home, Layers, Target, User } from 'lucide-react'

const TABS = [
  { href: '/dashboard', label: 'Today', Icon: Home },
  { href: '/learn/mathematics', label: 'Learn', Icon: BookOpen, match: '/learn' },
  { href: '/practice/mathematics', label: 'Practice', Icon: Target, match: '/practice' },
  { href: '/cards', label: 'Cards', Icon: Layers },
  { href: '/settings', label: 'Me', Icon: User },
]

/** Bottom tabs on phones, a left rail from `md` up. */
export function TabBar() {
  const pathname = usePathname()
  const isActive = (t: (typeof TABS)[number]) =>
    t.match ? pathname.startsWith(t.match) : pathname === t.href

  return (
    <>
      {/* Mobile — fixed bottom bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Main"
      >
        <ul className="mx-auto flex max-w-lg items-stretch">
          {TABS.map((t) => {
            const active = isActive(t)
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  aria-current={active ? 'page' : undefined}
                  className="press flex h-[60px] flex-col items-center justify-center gap-1 no-underline"
                >
                  <t.Icon
                    className="h-[22px] w-[22px] transition-colors"
                    style={{ color: active ? 'var(--primary)' : 'var(--ink-faint)' }}
                    strokeWidth={active ? 2.3 : 1.8}
                  />
                  <span
                    className="text-[10.5px] font-medium transition-colors"
                    style={{ color: active ? 'var(--primary)' : 'var(--ink-faint)' }}
                  >
                    {t.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Desktop — left rail */}
      <nav
        className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center gap-1 border-r border-line bg-surface py-5 md:flex lg:w-[210px] lg:items-stretch lg:px-3"
        aria-label="Main"
      >
        <Link
          href="/dashboard"
          className="mb-5 flex items-center gap-2.5 no-underline lg:px-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" width={30} height={30} className="h-[30px] w-[30px] rounded-lg" />
          <span className="font-display hidden text-[17px] text-ink lg:inline">Ewin</span>
        </Link>

        {TABS.map((t) => {
          const active = isActive(t)
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? 'page' : undefined}
              className="press flex items-center justify-center gap-3 rounded-xl px-2 py-3 no-underline transition-colors lg:justify-start lg:px-3"
              style={{
                background: active ? 'var(--primary-soft)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--ink-muted)',
              }}
            >
              <t.Icon className="h-[21px] w-[21px] shrink-0" strokeWidth={active ? 2.3 : 1.8} />
              <span className="hidden text-[14px] font-medium lg:inline">{t.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
