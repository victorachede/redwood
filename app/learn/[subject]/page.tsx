'use client'

import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { getSubject } from '../../lib/subjects'
import { saveSession } from '../../lib/progress'

type Message = {
  role: 'tutor' | 'student'
  content: string
  type?: string
}

function storageKey(subjectId: string, topic: string) {
  return `ewin-msgs-${subjectId}-${topic}`
}

function loadMessages(subjectId: string, topic: string): Message[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(subjectId, topic)) || '[]') as Message[]
  } catch {
    return []
  }
}

function persistMessages(subjectId: string, topic: string, msgs: Message[]) {
  try {
    localStorage.setItem(storageKey(subjectId, topic), JSON.stringify(msgs.slice(-40)))
  } catch {
    /* ignore */
  }
}


function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  )
}

function formatContent(text: string) {
  const parts = text.split(/(Question:\s*)/i)
  if (parts.length < 2) {
    return <p className="whitespace-pre-wrap leading-relaxed text-ink">{text}</p>
  }
  const nodes: React.ReactNode[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue
    if (/^Question:\s*$/i.test(part)) {
      nodes.push(
        <span
          key={i}
          className="mt-3 mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-accent"
        >
          Question
        </span>
      )
    } else if (i > 0 && /^Question:/i.test(parts[i - 1] || '')) {
      nodes.push(
        <p key={i} className="whitespace-pre-wrap font-medium leading-relaxed text-ink">
          {part.trim()}
        </p>
      )
    } else {
      nodes.push(
        <p key={i} className="whitespace-pre-wrap leading-relaxed text-ink">
          {part.trim()}
        </p>
      )
    }
  }
  return <div className="space-y-1">{nodes}</div>
}

export default function LearnPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const [focus, setFocus] = useState<string | null>(null)
  const [topicFromUrl, setTopicFromUrl] = useState<string | null>(null)
  const autoStarted = useRef(false)
  const meta = getSubject(subject)
  const subjectLabel =
    meta?.name ?? subject.charAt(0).toUpperCase() + subject.slice(1).replace(/-/g, ' ')

  const [topic, setTopic] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedTopics, setSavedTopics] = useState<Record<string, boolean>>({})
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const topics = meta?.topics ?? ['General foundations']
    const map: Record<string, boolean> = {}
    for (const tpc of topics) {
      map[tpc] = loadMessages(subject, tpc).length > 0
    }
    setSavedTopics(map)
    try {
      const sp = new URLSearchParams(window.location.search)
      const q = sp.get('focus')
      const tp = sp.get('topic')
      if (q) setFocus(q)
      if (tp) setTopicFromUrl(tp)
    } catch {
      /* ignore */
    }
  }, [subject, meta?.topics])

  // Practice → tutor: auto-start on the right topic with the missed question
  useEffect(() => {
    if (autoStarted.current || started) return
    if (!focus) return
    const chosen =
      topicFromUrl ||
      meta?.topics?.[0] ||
      'General foundations'
    autoStarted.current = true
    void startSession(chosen, { focus })
  }, [focus, topicFromUrl, meta?.topics, started])

  useEffect(() => {
    if (started && !loading) inputRef.current?.focus()
  }, [started, loading, messages.length])

  async function startSession(chosenTopic: string, opts?: { resume?: boolean; focus?: string }) {
    setTopic(chosenTopic)
    setStarted(true)
    setError(null)
    const focusHint = opts?.focus ?? focus ?? undefined
    const existing = loadMessages(subject, chosenTopic)
    if (opts?.resume && !focusHint && existing.length > 0) {
      setMessages(existing)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subjectLabel,
          topic: chosenTopic,
          messages: [],
          action: 'start',
          focus: focusHint,
        }),
      })
      if (!res.ok) throw new Error('fail')
      const data = await res.json()
      const initial: Message[] = [{ role: 'tutor', content: data.response, type: 'lesson' }]
      setMessages(initial)
      persistMessages(subject, chosenTopic, initial)
      saveSession({
        subjectId: subject,
        subjectName: subjectLabel,
        topic: chosenTopic,
        at: Date.now(),
      })
    } catch {
      setError('Could not start the session. Check your connection and try again.')
      setStarted(false)
      setTopic(null)
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
        body: JSON.stringify({
          subject: subjectLabel,
          topic,
          messages: updated,
          action: 'respond',
        }),
      })
      if (!res.ok) throw new Error('fail')
      const data = await res.json()
      const next: Message[] = [...updated, { role: 'tutor', content: data.response as string, type: data.type as string }]
      setMessages(next)
      if (topic) persistMessages(subject, topic, next)
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

  /* ── Topic picker ── */
  if (!started) {
    return (
      <main className="min-h-dvh bg-paper text-ink">
        <header className="border-b border-line bg-paper">
          <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
            <Link
              href="/#subjects"
              className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted no-underline hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Subjects
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
            {meta?.exam ?? 'WAEC · JAMB'}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink">
            {subjectLabel}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
            {meta?.blurb} Pick a topic below. Ewin will start from the basics.
          </p>
          {focus && !started && (
            <p className="mt-4 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-[13px] text-ink">
              Starting a lesson on the question you missed…
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}

          <div className="mt-8 space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
              Pick a topic
            </p>
            {(meta?.topics ?? ['General foundations']).map((t) => {
              const hasSaved = !!savedTopics[t]
              return (
                <div key={t} className="rounded-2xl border border-line bg-white overflow-hidden">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void startSession(t)}
                    className="group flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-paper/80 disabled:opacity-60"
                  >
                    <span className="text-[14px] font-medium text-ink">{t}</span>
                    <ArrowRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  </button>
                  {hasSaved && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void startSession(t, { resume: true })}
                      className="w-full border-t border-line px-4 py-2 text-left text-[12px] font-medium text-accent hover:bg-accent-soft"
                    >
                      Continue this topic
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <p className="mt-6 text-center text-xs text-ink-muted">
            Type your answers in your own words
          </p>
        </div>
      </main>
    )
  }

  /* ── Live session ── */
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <header className="shrink-0 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link
            href={`/learn/${subject}`}
            onClick={(e) => {
              e.preventDefault()
              setStarted(false)
              setMessages([])
              setTopic(null)
            }}
            className="text-ink-muted hover:text-ink"
            aria-label="Back to topics"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-ink">{subjectLabel}</p>
            <p className="truncate text-[11px] text-ink-muted">{topic}</p>
          </div>
          <span className="hidden rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent sm:inline">
            Session
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
                <span className="mb-1.5 ml-1 text-[11px] font-medium text-ink-muted">Ewin</span>
              )}
              <div
                className={`max-w-[min(100%,28rem)] rounded-2xl px-4 py-3 text-[14px] sm:max-w-[85%] ${
                  m.role === 'student'
                    ? 'rounded-tr-md bg-accent text-paper'
                    : 'rounded-tl-md border border-line bg-white shadow-[0_1px_0_var(--line)]'
                }`}
              >
                {m.role === 'tutor' ? (
                  formatContent(m.content)
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex flex-col items-start">
              <span className="mb-1.5 ml-1 text-[11px] font-medium text-ink-muted">Ewin</span>
              <TypingIndicator />
            </div>
          )}
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-line bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex max-w-2xl gap-2 px-4">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Write your answer here…"
            disabled={loading}
            className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-line bg-paper px-3.5 py-3 text-[14px] text-ink outline-none placeholder:text-ink-muted focus:border-accent disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-paper transition-colors hover:bg-accent-hover disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl px-4 text-center text-[11px] text-ink-muted">
          Press Enter to send
        </p>
      </div>
    </main>
  )
}
