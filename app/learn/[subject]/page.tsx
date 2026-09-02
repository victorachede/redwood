'use client'

import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, FileText, Plus, X, BookOpen } from 'lucide-react'
import { getSubject } from '../../lib/subjects'
import { saveSession, saveTutorMessages, recordMastery } from '../../lib/progress'
import { addCard } from '../../lib/cards'
import { readTutorStream, type TutorEvent } from '@/app/lib/tutorProtocol'
import type {
  AssignWorkInput,
  SaveStudyCardInput,
  RecordMasteryInput,
} from '@/app/lib/tutorProtocol'
import { openWorkFromTutor } from '@/app/lib/workGate'
import { EwinAvatar } from '@/components/EwinAvatar'
import { SubjectIcon } from '@/components/SubjectIcon'

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
  void saveTutorMessages({ subjectId, topic, messages: msgs.slice(-40) })
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
    <div className="animate-fade-up flex items-start gap-2.5">
      <EwinAvatar size={30} />
      <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-white px-4 py-3.5 shadow-[var(--shadow-sm)]">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}

function YouAvatar() {
  return (
    <div className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-600 to-navy-800">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.85)" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="rgba(255,255,255,0.85)" />
      </svg>
    </div>
  )
}

/** Splits a tutor reply into prose plus its check question, keyed to the
 *  subject's own accent so the chat feels part of that subject. */
function formatContent(text: string, accent: string, streaming = false) {
  const qIdx = text.search(/Question:/i)
  if (qIdx === -1) {
    return (
      <p
        className={`whitespace-pre-wrap text-[14.5px] leading-[1.65] text-ink ${
          streaming ? 'stream-caret' : ''
        }`}
      >
        {text.trim()}
      </p>
    )
  }
  const body = text.slice(0, qIdx).trim()
  const question = text.slice(qIdx).replace(/^Question:\s*/i, '').trim()
  return (
    <div className="space-y-2.5">
      {body && <p className="whitespace-pre-wrap text-[14.5px] leading-[1.65] text-ink">{body}</p>}
      <div
        className="rounded-xl border-l-[3px] px-3.5 py-3"
        style={{
          borderColor: accent,
          background: `color-mix(in srgb, ${accent} 7%, transparent)`,
        }}
      >
        <p
          className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: accent }}
        >
          Your turn
        </p>
        <p
          className={`text-[14.5px] font-medium leading-[1.5] text-ink ${
            streaming ? 'stream-caret' : ''
          }`}
        >
          {question}
        </p>
      </div>
    </div>
  )
}

export default function LearnPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const [focus, setFocus] = useState<string | null>(null)
  const [topicFromUrl, setTopicFromUrl] = useState<string | null>(null)
  const autoStarted = useRef(false)
  const meta = getSubject(subject)
  const subjectLabel =
    meta?.name ?? subject.charAt(0).toUpperCase() + subject.slice(1).replace(/-/g, ' ')
  /** Subject accent drives the question block, topic numerals and header rule. */
  const accent = meta?.accent ?? 'var(--navy-700)'

  const [topic, setTopic] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [suggestedCards, setSuggestedCards] = useState<{ front: string; back: string }[]>([])
  const [pendingWork, setPendingWork] = useState<AssignWorkInput | null>(null)
  const clarifyUsedRef = useRef(false)
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

  async function onPickFiles(files: FileList | null) {
    if (!files?.length) return
    const next: DocAttach[] = [...docs]
    for (const file of Array.from(files).slice(0, 3 - docs.length)) {
      if (file.size > 400_000) {
        setError('File is too large (max ~400KB). Try a shorter note.')
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

  /**
   * Runs one streamed turn: appends prose deltas to a live tutor message and
   * routes tool calls to real handlers. Replaces the old regex scraping of
   * ACTION:/BRIEF:/STUDY_CARDS: out of the model's prose.
   */
  async function runTurn(res: Response, base: Message[], type?: string) {
    let text = ''
    let failed: string | null = null

    await readTutorStream(res, (e: TutorEvent) => {
      switch (e.t) {
        case 'text': {
          text += e.v
          setMessages([...base, { role: 'tutor', content: text, type }])
          break
        }
        case 'tool': {
          if (e.name === 'save_study_card') {
            const c = e.input as SaveStudyCardInput
            if (c?.front && c?.back) {
              setSuggestedCards((prev) =>
                prev.some((x) => x.front === c.front) ? prev : [...prev, c],
              )
            }
          } else if (e.name === 'assign_work') {
            const w = e.input as AssignWorkInput
            if (w?.kind) setPendingWork(w)
          } else if (e.name === 'record_mastery') {
            const m = e.input as RecordMasteryInput
            if (m?.topic && m?.level) recordMastery(subject, m.topic, m.level)
          }
          break
        }
        case 'error':
          failed = e.message
          break
        case 'done':
        default:
          break
      }
    })

    if (failed && !text) throw new Error(failed)
    return { text, failed }
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
          clarifyUsed: clarifyUsedRef.current,
        }),
      })
      if (!res.ok) throw new Error(await readTutorError(res))

      setSuggestedCards([])
      setPendingWork(null)
      const { text, failed } = await runTurn(res, [], 'lesson')
      if (failed) setError(failed)

      const initial: Message[] = [{ role: 'tutor', content: text, type: 'lesson' }]
      setMessages(initial)
      persistMessages(subject, chosenTopic, initial)
      saveSession({ subjectId: subject, subjectName: subjectLabel, topic: chosenTopic, at: Date.now() })
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
    if (inputRef.current) inputRef.current.style.height = 'auto'
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
          clarifyUsed: clarifyUsedRef.current,
        }),
      })
      if (!res.ok) throw new Error(await readTutorError(res))

      setSuggestedCards([])
      const { text, failed } = await runTurn(res, updated)
      if (failed) setError(failed)

      const next: Message[] = [...updated, { role: 'tutor', content: text }]
      setMessages(next)
      if (topic) persistMessages(subject, topic, next)
      inputRef.current?.blur()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Message failed. Try again.')
      setMessages(messages)
      setInput(userMsg.content)
      setDocs(docsSnapshot)
    } finally {
      setLoading(false)
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  // ── Topic picker screen ────────────────────────────────────────────────────
  if (!started) {
    return (
      <main className="min-h-dvh bg-paper text-ink">
        <header className="border-b border-line bg-paper/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] text-ink-muted no-underline transition-colors hover:bg-paper-sunken hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
          <div className="flex items-center gap-3.5">
            {meta ? (
              <SubjectIcon icon={meta.icon} accent={accent} size={48} tone="solid" />
            ) : (
              <EwinAvatar size={44} />
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                {meta?.exam ?? 'WAEC · JAMB'}
              </p>
              <h1 className="font-serif text-[1.75rem] font-semibold tracking-[-0.025em] text-ink">
                {subjectLabel}
              </h1>
            </div>
          </div>

          {meta?.blurb && (
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{meta.blurb}</p>
          )}

          {focus && (
            <div
              className="mt-4 rounded-xl border-l-[3px] px-3.5 py-3"
              style={{
                borderColor: accent,
                background: `color-mix(in srgb, ${accent} 8%, transparent)`,
              }}
            >
              <p className="text-[13px] text-ink">
                Starting a focused lesson on the question you missed…
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-danger-soft px-3.5 py-3">
              <p className="text-[13px] text-red-800">{error}</p>
            </div>
          )}

          <div className="mt-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Choose a topic
            </p>
            <div className="space-y-2">
              {(meta?.topics ?? ['General foundations']).map((t, idx) => {
                const hasSaved = !!savedTopics[t]
                return (
                  <div
                    key={t}
                    className="lift group overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-sm)]"
                  >
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void startSession(t)}
                      className="flex w-full items-center gap-3.5 px-4 py-4 text-left transition-colors hover:bg-paper-sunken/60 disabled:opacity-60"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold"
                        style={{
                          background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                          color: accent,
                        }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-[14.5px] font-medium text-ink">{t}</span>
                      <span className="flex items-center gap-2">
                        {hasSaved && (
                          <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-medium text-green-700">
                            In progress
                          </span>
                        )}
                        <ArrowRight
                          className="h-4 w-4 text-ink-subtle transition-all duration-300 group-hover:translate-x-1"
                          style={{ color: accent }}
                        />
                      </span>
                    </button>
                    {hasSaved && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => void startSession(t, { resume: true })}
                        className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-left text-[12px] font-medium transition-colors hover:bg-paper-sunken disabled:opacity-60"
                        style={{ color: accent }}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Resume where I left off
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    )
  }

  const canSend = Boolean(input.trim() || docs.length) && !loading

  // ── Chat screen ────────────────────────────────────────────────────────────
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      {/* Header */}
      <header className="relative shrink-0 border-b border-line bg-paper/90 backdrop-blur-md">
        {/* Subject accent seals the top of the chat */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => {
              setStarted(false)
              setMessages([])
              setTopic(null)
              setError(null)
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-paper-sunken hover:text-ink"
            aria-label="Back to topics"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {meta ? (
            <SubjectIcon icon={meta.icon} accent={accent} size={30} />
          ) : (
            <EwinAvatar size={30} />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold leading-tight text-ink">
              {subjectLabel}
            </p>
            {topic && (
              <p className="truncate text-[11px] leading-tight text-ink-muted">{topic}</p>
            )}
          </div>

          {demoMode && (
            <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-[10px] font-medium text-ink-muted">
              Demo
            </span>
          )}
        </div>
      </header>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-6 pb-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`animate-fade-up flex gap-2.5 ${
                m.role === 'student' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {m.role === 'tutor' ? <EwinAvatar size={30} className="mt-0.5" /> : <YouAvatar />}

              <div
                className={`max-w-[min(100%,26rem)] sm:max-w-[82%] ${
                  m.role === 'student'
                    ? 'rounded-2xl bg-gradient-to-br from-[#0e1b3a] to-[#1f3563] px-4 py-3 text-[var(--on-accent)] shadow-[var(--shadow-navy)]'
                    : 'rounded-2xl border border-line bg-white px-4 py-3 shadow-[var(--shadow-md)]'
                }`}
              >
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {m.attachments.map((a) => (
                      <span
                        key={a.name}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                          m.role === 'student'
                            ? 'bg-white/15 text-[var(--on-accent)]'
                            : 'bg-paper-sunken text-ink-muted'
                        }`}
                      >
                        <FileText className="h-3 w-3" />
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}
                {m.role === 'tutor' ? (
                  formatContent(
                    m.content,
                    accent,
                    loading && i === messages.length - 1,
                  )
                ) : (
                  <p className="whitespace-pre-wrap text-[14.5px] leading-[1.55]">{m.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && messages[messages.length - 1]?.role !== 'tutor' && <TypingIndicator />}

          {/* Work assigned by the tutor — a card the student taps, replacing the
              old unannounced window.location redirect 1.6s after a reply. */}
          {pendingWork && (
            <div className="animate-fade-up rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-sm)]">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: accent }}
              >
                {pendingWork.kind === 'classwork' ? 'Classwork' : 'Homework'} ready
              </p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
                {pendingWork.brief}
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const w = pendingWork
                    setPendingWork(null)
                    openWorkFromTutor(w.kind, {
                      subjectId: subject,
                      topic: w.topic ?? topic ?? undefined,
                      brief: w.brief,
                    })
                  }}
                  className="rounded-xl px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: accent }}
                >
                  Start {pendingWork.kind}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingWork(null)}
                  className="rounded-xl border border-line px-4 py-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:bg-paper-sunken"
                >
                  Not now
                </button>
              </div>
            </div>
          )}

          {/* Study card suggestions */}
          {suggestedCards.length > 0 && (
            <div className="animate-fade-up rounded-2xl border border-gold-500/25 bg-gold-500/[0.07] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600">
                Study cards
              </p>
              <p className="mt-0.5 mb-3 text-[12px] text-ink-muted">
                Save these to review later
              </p>
              <ul className="space-y-2.5">
                {suggestedCards.map((c) => (
                  <li
                    key={c.front}
                    className="flex items-start justify-between gap-3 rounded-xl border border-accent/15 bg-white px-3.5 py-3"
                  >
                    <span className="text-[13px] leading-snug text-ink">{c.front}</span>
                    <button
                      type="button"
                      className="shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-[var(--on-accent)] transition-opacity hover:opacity-80"
                      onClick={() => {
                        addCard({ front: c.front, back: c.back, subject: subjectLabel, source: 'tutor' })
                        setSuggestedCards((s) => s.filter((x) => x.front !== c.front))
                      }}
                    >
                      Save
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="animate-fade-up rounded-xl border border-red-100 bg-red-50 px-3.5 py-3">
              <p className="text-[13px] text-red-700">{error}</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 bg-gradient-to-t from-paper via-paper/95 to-transparent pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto max-w-2xl px-3">
          {/* Attached files */}
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
                    className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted hover:bg-neutral-100 hover:text-ink"
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

          <div
            className="ewin-composer flex items-end gap-1 rounded-[1.5rem] px-1.5 py-1.5 shadow-[0_4px_18px_-4px_rgba(10,20,40,0.4),0_0_0_1px_rgba(255,255,255,0.07)] transition-shadow focus-within:shadow-[0_4px_18px_-4px_rgba(10,20,40,0.45),0_0_0_1px_rgba(201,168,76,0.45)]"
            style={{ background: 'linear-gradient(180deg, #16223d 0%, #0c1428 100%)' }}
          >
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={loading || docs.length >= 3}
              className="mb-[1px] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/10 hover:text-white/90 disabled:opacity-30 focus:outline-none"
              aria-label="Attach document"
            >
              <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Message Ewin…"
              disabled={loading}
              className="max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent py-2.5 pr-1 text-[15px] leading-snug text-white/95 outline-none ring-0 border-0 focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:text-white/30 disabled:opacity-50"
              style={{ boxShadow: 'none' }}
            />

            <button
              type="button"
              onClick={() => void send()}
              disabled={!canSend}
              className={`mb-[1px] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 focus:outline-none ${
                canSend
                  ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-navy-800 shadow-[0_2px_10px_-2px_rgba(201,168,76,0.6)] hover:scale-105 active:scale-95'
                  : 'bg-white/10 text-white/30'
              }`}
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 20V4M12 4L5 11M12 4l7 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <p className="mt-1.5 text-center text-[11px] text-white/0 select-none" aria-hidden>
            {/* spacer */}
          </p>
        </div>
      </div>
    </main>
  )
}
