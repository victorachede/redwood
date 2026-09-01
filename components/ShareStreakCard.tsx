'use client'

import { useEffect, useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import { getStreak } from '@/app/lib/progress'
import { getSession } from '@/app/lib/auth'
import { EwinAvatar } from '@/components/EwinAvatar'

export function ShareStreakCard() {
  const [streak, setStreak] = useState(0)
  const [name, setName] = useState('Student')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setStreak(getStreak())
    setName(getSession()?.displayName || 'Student')
  }, [])

  const text =
    streak > 0
      ? `I'm on a ${streak}-day study streak with Ewin 🔥 WAEC/JAMB prep, one idea at a time.`
      : `I'm studying with Ewin for WAEC & JAMB — short lessons, real checks.`

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ewin streak', text, url: window.location.origin })
        return
      } catch {
        /* fall through */
      }
    }
    await navigator.clipboard.writeText(`${text}\n${window.location.origin}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[var(--paper-elevated)] shadow-[0_1px_0_var(--line)]">
      <div
        className="relative px-5 pb-5 pt-6 text-[var(--on-accent)]"
        style={{
          background: 'linear-gradient(145deg, #143526 0%, #1b4332 50%, #2d6a4f 100%)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
              Ewin · Study streak
            </p>
            <p className="mt-3 font-serif text-4xl font-semibold tracking-tight">
              {streak > 0 ? `${streak}` : '0'}
              <span className="ml-1 text-lg font-normal text-white/70">days</span>
            </p>
            <p className="mt-1 text-[13px] text-white/75">{name}</p>
          </div>
          <EwinAvatar size={40} className="ring-2 ring-white/20" />
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-white/80">
          One idea at a time. Prove it. Show up tomorrow.
        </p>
      </div>
      <div className="flex gap-2 p-3">
        <button
          type="button"
          onClick={() => void share()}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-[13px] font-medium text-[var(--on-accent)] hover:bg-accent-hover"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Share streak'}
        </button>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="flex items-center justify-center rounded-full border border-line px-3.5 text-ink-muted hover:text-ink"
          aria-label="Copy"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
