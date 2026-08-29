'use client'

import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { getSubject } from '../../lib/subjects'

type Message = {
  role: 'tutor' | 'student'
  content: string
  type?: 'lesson' | 'question' | 'feedback' | 'response'
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 w-fit">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  )
}

function formatContent(text: string) {
  const parts = text.split(/(Question:\s*)/i)
  if (parts.length < 2) {
    return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
  }
  const nodes: React.ReactNode[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue
    if (/^Question:\s*$/i.test(part)) {
      nodes.push(
        <span
          key={i}
          className="mt-3 mb-1 inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]"
        >
          Question
        </span>
      )
    } else if (i > 0 && /^Question:/i.test(parts[i - 1] || '')) {
      nodes.push(
        <p key={i} className="mt-1 whitespace-pre-wrap font-medium leading-relaxed text-[var(--text)]">
          {part.trim()}
        </p>
      )
    } else {
      nodes.push(
        <p key={i} className="whitespace-pre-wrap leading-relaxed text-[var(--text-secondary)]">
          {part.trim()}
        </p>
      )
    }
  }
  return <div className="space-y-1">{nodes}</div>
}

export default function LearnPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const meta = getSubject(subject)
  const subjectLabel = meta?.name ?? subject.charAt(0).toUpperCase() + subject.slice(1).replace(/-/g, ' ')
  const accent = meta?.accent ?? '#3dd68c'

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (started && !loading) inputRef.current?.focus()
  }, [started, loading, messages.length])

  async function startSession() {
    setStarted(true)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, messages: [], action: 'start' }),
      })
      if (!res.ok) throw new Error('Tutor unavailable right now')
      const data = await res.json()
      setMessages([{ role: 'tutor', content: data.response, type: 'lesson' }])
    } catch {
      setError('Could not start the session. Check your connection and try again.')
      setStarted(false)
    } finally {
      setLoading(false)
    }
  }

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'student', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, messages: updated, action: 'respond' }),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setMessages([...updated, { role: 'tutor', content: data.response, type: data.type }])
    } catch {
      setError('Message failed to send. Try again.')
      setMessages(messages)
      setInput(userMsg.content)
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  if (!started) {
    return (
      <main className="relative flex min-h-dvh flex-col">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${accent}22, transparent 55%)`,
          }}
        />
        <header className="border-b border-[var(--border)]/80">
          <div className="mx-auto flex h-14 max-w-lg items-center px-4">
            <Link
              href="/"
              className="text-[13px] text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text)]"
            >
              ← All subjects
            </Link>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
          <div className="animate-fade-up text-center">
            <span
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
              style={{
                background: `${accent}18`,
                border: `1px solid ${accent}40`,
                color: accent,
              }}
            >
              {meta?.icon ?? '📖'}
            </span>
            <h1 className="text-[1.75rem] font-semibold tracking-tight text-[var(--text)]">
              {subjectLabel}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-[var(--text-secondary)]">
              {meta?.blurb ?? 'Learn step by step with Ewin.'} You will get one concept, then one
              question — answer in your own words.
            </p>

            {error && (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void startSession()}
              disabled={loading}
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl px-8 text-[15px] font-semibold transition-opacity disabled:opacity-60"
              style={{ background: accent, color: '#0a0f0d' }}
            >
              {loading ? 'Starting…' : 'Begin session'}
            </button>
            <p className="mt-4 text-[12px] text-[var(--text-muted)]">Free · no account needed</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link
            href="/"
            className="text-[13px] text-[var(--text-muted)] no-underline hover:text-[var(--text)]"
          >
            ←
          </Link>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
            style={{ background: `${accent}18`, color: accent }}
          >
            {meta?.icon ?? '📖'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold tracking-tight">{subjectLabel}</p>
            <p className="text-[11px] text-[var(--text-muted)]">Session with Ewin</p>
          </div>
          <span
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Live
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`animate-fade-up flex flex-col ${
                m.role === 'student' ? 'items-end' : 'items-start'
              }`}
            >
              {m.role === 'tutor' && (
                <span className="mb-1.5 ml-1 text-[11px] font-medium text-[var(--text-muted)]">
                  Ewin
                </span>
              )}
              <div
                className={`max-w-[min(100%,28rem)] rounded-2xl px-4 py-3 text-[14px] sm:max-w-[85%] ${
                  m.role === 'student'
                    ? 'rounded-tr-md text-[var(--accent-text)]'
                    : 'rounded-tl-md border border-[var(--border)] bg-[var(--bg-card)]'
                }`}
                style={
                  m.role === 'student'
                    ? { background: accent }
                    : undefined
                }
              >
                {m.role === 'tutor' ? formatContent(m.content) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex flex-col items-start">
              <span className="mb-1.5 ml-1 text-[11px] font-medium text-[var(--text-muted)]">
                Ewin
              </span>
              <TypingIndicator />
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
              {error}
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-elevated)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex max-w-2xl gap-2 px-4">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Type your answer…"
            disabled={loading}
            className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-3 text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[var(--accent-text)] transition-opacity disabled:opacity-40"
            style={{ background: accent }}
            aria-label="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl px-4 text-center text-[11px] text-[var(--text-muted)]">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </main>
  )
}
