'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

/** Cycles light/dark and persists it. The pre-paint script in layout.tsx
 *  applies the saved value, so this only has to handle changes. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const saved = (() => {
      try {
        return localStorage.getItem('ewin-theme') as Theme | null
      } catch {
        return null
      }
    })()
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved)
      return
    }
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('ewin-theme', next)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`press flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-sunken hover:text-ink ${className}`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Render nothing until mounted so the icon can't flash the wrong way */}
      {theme === 'dark' ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : theme === 'light' ? (
        <Moon className="h-[18px] w-[18px]" />
      ) : (
        <span className="h-[18px] w-[18px]" />
      )}
    </button>
  )
}
