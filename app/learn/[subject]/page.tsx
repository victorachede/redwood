'use client'

import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, FileText, Plus, X } from 'lucide-react'
import { getSubject } from '../../lib/subjects'
import { saveSession } from '../../lib/progress'
import { EwinAvatar } from '@/components/EwinAvatar'

type Message = {
  role: 'tutor' | 'student'
  content: string
  type?: string
  attachments?: { name: string }[]
}

type DocAttach = { name: string; text: string }

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

async function readTutorError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    if (data?.error) return data.error
  } catch {
    /* ignore */
  }
  if (res.status === 503) return 'Tutor is not set up yet. Add ANTHROPIC_API_KEY in Vercel.'
  if (res.status >= 500) return 'Tutor could not reply right now. Try again in a moment.'
  return 'Something went wrong. Try again.'
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <EwinAvatar size={28} />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 shadow-[0_1px_0_var(--line)]">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}

function formatContent(text: string) {
  const parts = text.split(/(Question:\s*)/i)
  if (parts.length < 2) {
    return (
      <p className="whitespace-pre-wrap text-[14.5px] leading-[1.55] text-ink">{text}</p>
    )
  }
  const nodes: React.ReactNode[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue
    if (/^Question:\s*$/i.test(part)) {
      nodes.push(
        <div
          key={i}
          className="mt-3 rounded-xl border border-accent/25 bg-accent-soft/80 px-3.5 py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
            Your turn — answer this
          </p>
        </div>
      )
    } else if (i > 0 && /^Question:/i.test(parts[i - 1] || '')) {
      nodes.push(
        <p
          key={i}
          className="-mt-1 rounded-b-xl border border-t-0 border-accent/25 bg-accent-soft/80 px-3.5 pb-3 text-[14.5px] font-medium leading-[1.5] text-ink"
        >
          {part.trim()}
        </p>
      )
    } else {
      nodes.push(
        <p key={i} className="whitespace-pre-wrap text-[14.5px] leading-[1.55] text-ink">
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
  const [demoMode, setDemoMode] = useState(false)
  const [savedTopics, setSavedTopics] = useState<Record<string, boolean>>({})
  const [docs, setDocs] = useState<DocAttach[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (autoStarted.current || started) return
    if (!focus) return
    const chosen = topicFromUrl || meta?.topics?.[0] || 'General foundations'
    autoStarted.current = true
    void startSession(chosen, { focus })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, topicFromUrl, meta?.topics, started])

  useEffect(() => {
    if (started && !loading) inputRef.current?.focus()
  }, [started, loading, messages.length])

  async function onPickFiles(files: FileList | null) {
    if (!files?.length) return
    const next: DocAttach[] = [...docs]
    for (const file of Array.from(files).slice(0, 3 - docs.length)) {
      if (file.size > 400_000) {
        setError('File is too large (max ~400KB for now). Try a shorter note.')
        continue
      }
      const text = await file.text().catch(() => '')
      if (!text.trim()) {
        setError(`Could not read text from ${file.name}. Use .txt, .md, or other text notes.`)
        continue
      }
      next.push({ name: file.name, text: text.slice(0, 8000) })
    }
    setDocs(next.slice(0, 3))
    if (fileRef.current) fileRef.current.value = ''
  }

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
          documents: docs,
        }),
      })
      if (!res.ok) throw new Error(await readTutorError(res))
      const data = await res.json()
      if (data.demo) setDemoMode(true)
      const initial: Message[] = [{ role: 'tutor', content: data.response, type: 'lesson' }]
      setMessages(initial)
      persistMessages(subject, chosenTopic, initial)
      saveSession({
        subjectId: subject,
        subjectName: subjectLabel,
        topic: chosenTopic,
        at: Date.now(),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the session. Try again.')
      setStarted(false)
      setTopic(null)
    } finally {
      setLoading(false)
    }
  }

  async function send() {
    if ((!input.trim() && docs.length === 0) || loading) return
    const label =
      input.trim() ||
      (docs.length ? `(Attached: ${docs.map((d) => d.name).join(', ')})` : '')
    const userMsg: Message = {
      role: 'student',
      content: label,
      attachments: docs.map((d) => ({ name: d.name })),
    }
    const updated = [...messages, userMsg]
    setMessages(updated)
    const docsSnapshot = [...docs]
    setInput('')
    setDocs([])
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
          documents: docsSnapshot,
        }),
      })
      if (!res.ok) throw new Error(await readTutorError(res))
      const data = await res.json()
      if (data.demo) setDemoMode(true)
      const next: Message[] = [
        ...updated,
        { role: 'tutor', content: data.response as string, type: data.type as string },
      ]
      setMessages(next)
      if (topic) persistMessages(subject, topic, next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Message failed. Try again.')
      setMessages(messages)
      setInput(userMsg.content)
      setDocs(docsSnapshot)
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
      <main className="min-h-dvh bg-paper text-ink">
        <header className="border-b border-line bg-paper">
          <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted no-underline hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
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
          {focus && (
            <p className="mt-4 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-[13px] text-ink">
              Starting a lesson on the question you missed…
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
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
                <div key={t} className="overflow-hidden rounded-2xl border border-line bg-white">
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
        </div>
      </main>
    )
  }

  const canSend = Boolean(input.trim() || docs.length) && !loading

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <header className="shrink-0 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => {
              setStarted(false)
              setMessages([])
              setTopic(null)
              setError(null)
            }}
            className="text-ink-muted hover:text-ink"
            aria-label="Back to topics"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <EwinAvatar size={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-ink">{subjectLabel}</p>
            <p className="truncate text-[11px] text-ink-muted">{topic}</p>
          </div>
          {demoMode && (
            <span className="rounded-full border border-line bg-white px-2 py-0.5 text-[10px] font-medium text-ink-muted">
              Demo
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-6 pb-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`animate-fade-up flex gap-2.5 ${
                m.role === 'student' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {m.role === 'tutor' ? (
                <EwinAvatar size={28} className="mt-0.5" />
              ) : (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-white text-[10px] font-semibold text-ink-muted">
                  You
                </div>
              )}
              <div
                className={`max-w-[min(100%,26rem)] sm:max-w-[80%] ${
                  m.role === 'student'
                    ? 'rounded-2xl rounded-tr-md bg-accent px-4 py-3 text-paper shadow-[0_8px_24px_-12px_rgba(27,67,50,0.45)]'
                    : 'rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 shadow-[0_1px_0_var(--line),0_8px_24px_-16px_rgba(22,21,19,0.12)]'
                }`}
              >
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {m.attachments.map((a) => (
                      <span
                        key={a.name}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                          m.role === 'student'
                            ? 'bg-white/15 text-paper'
                            : 'bg-accent-soft text-accent'
                        }`}
                      >
                        <FileText className="h-3 w-3" />
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}
                {m.role === 'tutor' ? (
                  formatContent(m.content)
                ) : (
                  <p className="whitespace-pre-wrap text-[14.5px] leading-[1.5]">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && <TypingIndicator />}
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
              {error}
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 bg-gradient-to-t from-paper via-paper to-transparent pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto max-w-2xl px-3">
          {docs.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5 px-1">
              {docs.map((d) => (
                <span
                  key={d.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-2.5 pr-1 text-[12px] text-ink shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5 text-accent" />
                  <span className="max-w-[10rem] truncate">{d.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${d.name}`}
                    onClick={() => setDocs((prev) => prev.filter((x) => x.name !== d.name))}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted hover:bg-paper hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.csv,.json,text/plain,text/*"
            multiple
            className="hidden"
            onChange={(e) => void onPickFiles(e.target.files)}
          />

          <div className="ewin-composer flex items-end gap-1.5 rounded-full bg-[#303036] px-1.5 py-1.5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)]">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={loading || docs.length >= 3}
              className="mb-0 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 focus:outline-none"
              aria-label="Add document"
            >
              <Plus className="h-5 w-5" strokeWidth={2} />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Message Ewin"
              disabled={loading}
              className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent py-3 pr-1 text-[15px] leading-snug text-white/95 outline-none ring-0 border-0 focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:text-white/35 disabled:opacity-60"
              style={{ boxShadow: 'none' }}
            />

            <button
              type="button"
              onClick={() => void send()}
              disabled={!canSend}
              className={`mb-0 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none ${
                canSend
                  ? 'bg-white text-[#1a1a1e] hover:bg-white/90'
                  : 'bg-white/15 text-white/40'
              }`}
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 19V5M12 5l-6 6M12 5l6 6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
