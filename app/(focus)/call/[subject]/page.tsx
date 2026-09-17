'use client'

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { X, Mic, MicOff, PhoneOff, Radio } from 'lucide-react'
import { getSubject } from '@/app/lib/subjects'
import { getLocalPlan } from '@/app/lib/billing'
import { Mark } from '@/components/Mark'
import { Diagram } from '@/components/Diagram'
import type { ShowDiagramInput } from '@/app/lib/tutorProtocol'

type CallState = 'checking-plan' | 'not-voice-plan' | 'connecting' | 'not-configured' | 'live'

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function CallPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const meta = getSubject(subject)
  const subjectLabel = meta?.name ?? subject

  const [state, setState] = useState<CallState>('checking-plan')
  const [muted, setMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [ewinSpeaking, setEwinSpeaking] = useState(true)
  const [caption, setCaption] = useState<string | null>(null)
  const [diagram, setDiagram] = useState<ShowDiagramInput | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (getLocalPlan().plan !== 'voice') {
      setState('not-voice-plan')
      return
    }
    void startVoiceSession()
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Real connection goes here once DEEPGRAM_API_KEY exists: open the
   * Deepgram Voice Agent session with the token from /api/voice/token,
   * stream mic audio in, play TTS audio back, and route `show_diagram`
   * tool events into setDiagram / caption text into setCaption as they
   * arrive — the live-call UI below already has everything wired to
   * receive them, so none of it changes when this stub is replaced.
   */
  async function startVoiceSession() {
    setState('connecting')
    try {
      const res = await fetch('/api/voice/token', { method: 'POST' })
      if (!res.ok) {
        setState('not-configured')
        return
      }
      // Unreachable until the endpoint above actually mints a session —
      // left here so the live state wires in with no further changes.
      setState('live')
      tickRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } catch {
      setState('not-configured')
    }
  }

  function endCall() {
    if (tickRef.current) clearInterval(tickRef.current)
    window.location.href = '/dashboard'
  }

  if (state === 'checking-plan' || state === 'connecting') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm space-y-3">
          <div className="skeleton h-11 w-11 rounded-2xl" />
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton h-4 w-full" />
        </div>
      </main>
    )
  }

  if (state === 'not-voice-plan') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-5 text-ink">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-7 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
            <Radio className="h-6 w-6 text-primary" />
          </span>
          <h1 className="font-display text-[20px] text-ink">Voice is a Voice-tier feature</h1>
          <p className="mx-auto mt-2.5 max-w-xs text-[14px] leading-relaxed text-ink-muted">
            A real teacher on a call, with a whiteboard. Upgrade to unlock it.
          </p>
          <Link
            href="/pricing"
            className="press mt-6 inline-block rounded-full bg-primary px-6 py-3 text-[14.5px] font-medium text-on-primary no-underline"
          >
            See pricing
          </Link>
          <p className="mt-3.5 text-[13px] text-ink-muted">
            <Link href="/dashboard" className="font-medium text-primary no-underline">
              Back to Today
            </Link>
          </p>
        </div>
      </main>
    )
  }

  if (state === 'not-configured') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-5 text-ink">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-7 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
            <Radio className="h-6 w-6 text-primary" />
          </span>
          <h1 className="font-display text-[20px] text-ink">Voice is launching soon</h1>
          <p className="mx-auto mt-2.5 max-w-xs text-[14px] leading-relaxed text-ink-muted">
            The call screen is built — we&rsquo;re still connecting the line. Check back soon.
          </p>
          <Link
            href="/dashboard"
            className="press mt-6 inline-block rounded-full bg-primary px-6 py-3 text-[14.5px] font-medium text-on-primary no-underline"
          >
            Back to Today
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <header className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3">
        <button
          type="button"
          onClick={endCall}
          className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-sunken"
          aria-label="End call"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold leading-tight text-ink">
            {subjectLabel}
          </p>
          <p className="truncate text-[12px] leading-tight text-ink-muted">Live call with EWIN</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-sunken px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-correct" />
          <span className="text-[12.5px] font-medium tabular-nums text-ink-muted">
            {formatElapsed(elapsed)}
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden px-4 py-4">
        <p className="mb-2 shrink-0 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          On the whiteboard
        </p>
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex h-full w-full items-center justify-center p-6">
            {diagram ? (
              <div className="w-full max-w-lg [&_figure]:m-0 [&_figure]:border-0 [&_figure]:p-0 [&_svg]:h-auto [&_svg]:w-full">
                <Diagram spec={diagram.spec} />
              </div>
            ) : (
              <p className="text-[13.5px] text-ink-faint">Nothing on the board yet.</p>
            )}
          </div>

          {caption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/70 to-transparent px-5 pb-4 pt-10">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-paper/70">
                {ewinSpeaking ? 'EWIN' : 'You'}
              </p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-paper">{caption}</p>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-line px-5 pb-safe pt-4">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            {ewinSpeaking && <span className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />}
            <span className="absolute h-[52px] w-[52px] rounded-full bg-primary/10" />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-[var(--shadow-md)]">
              <Mark size={24} />
            </span>
          </div>
          <p className="text-[12.5px] font-medium text-ink-muted">
            {ewinSpeaking ? 'EWIN is speaking — tap to jump in' : 'Listening…'}
          </p>

          <div className="flex items-center gap-4 pb-1">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="press flex h-[52px] w-[52px] items-center justify-center rounded-full border border-line bg-surface text-ink"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={endCall}
              className="press flex h-[52px] w-[52px] items-center justify-center rounded-full text-white"
              style={{ background: 'var(--wrong)' }}
              aria-label="End call"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
