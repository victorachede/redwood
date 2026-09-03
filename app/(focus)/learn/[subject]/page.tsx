'use client'

import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Camera, FileText, Plus, X, BookOpen } from 'lucide-react'
import { getSubject } from '@/app/lib/subjects'
import {
  saveSession,
  saveTutorMessages,
  recordMastery,
  loadTutorMessages,
  loadSessions,
  type TutorMessage,
} from '@/app/lib/progress'
import { addCard } from '@/app/lib/cards'
import { readTutorStream, type TutorEvent } from '@/app/lib/tutorProtocol'
import type {
  AssignWorkInput,
  SaveStudyCardInput,
  RecordMasteryInput,
} from '@/app/lib/tutorProtocol'
import { openWorkFromTutor } from '@/app/lib/workGate'
import { buildLearnerProfile } from '@/app/lib/learnerProfile'
import { prepareImage, type PreparedImage } from '@/app/lib/image'
import { Diagram } from '@/components/Diagram'
import type { ShowDiagramInput } from '@/app/lib/tutorProtocol'
import { EwinAvatar } from '@/components/EwinAvatar'
import { SubjectIcon } from '@/components/SubjectIcon'
import { Avatar } from '@/components/ui/Avatar'

/** The transcript shape is owned by the data layer — see progress.ts. */
type Message = TutorMessage

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

function Thinking() {
  return (
    <div className="rise flex items-center gap-1.5 px-1 py-2">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <span className="ml-1 text-[12.5px] text-ink-faint">Ewin is thinking</span>
    </div>
  )
}

/**
 * Splits a tutor reply into explanation and its check question.
 * The question is the point of the whole app, so it gets its own block in
 * the subject's colour rather than being buried in a paragraph.
 */
function TutorBody({
  text,
  accent,
  streaming,
}: {
  text: string
  accent: string
  streaming?: boolean
}) {
  const i = text.search(/Question:/i)

  if (i === -1) {
    return (
      <p
        className={`whitespace-pre-wrap text-[15px] leading-[1.6] text-ink ${
          streaming ? 'caret' : ''
        }`}
      >
        {text.trim()}
      </p>
    )
  }

  const body = text.slice(0, i).trim()
  const question = text.slice(i).replace(/^Question:\s*/i, '').trim()

  return (
    <div className="space-y-3">
      {body && (
        <p className="whitespace-pre-wrap text-[15px] leading-[1.6] text-ink">{body}</p>
      )}
      <div
        className="rounded-xl px-3.5 py-3"
        style={{
          background: `color-mix(in srgb, ${accent} 9%, transparent)`,
          borderLeft: `3px solid ${accent}`,
        }}
      >
        <p
          className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: accent }}
        >
          Your turn
        </p>
        <p
          className={`text-[15px] font-medium leading-[1.5] text-ink ${
            streaming ? 'caret' : ''
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
  const accent = meta?.accent ?? 'var(--primary)'

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
  const [photos, setPhotos] = useState<PreparedImage[]>([])
  const photoRef = useRef<HTMLInputElement>(null)
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

    // A conversation started on another device should show as resumable here.
    void loadSessions().forEach((sess) => {
      if (sess.subjectId === subject && sess.topic) map[sess.topic] = true
    })
    setSavedTopics({ ...map })
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
    const figures: ShowDiagramInput[] = []

    await readTutorStream(res, (e: TutorEvent) => {
      switch (e.t) {
        case 'text': {
          text += e.v
          setMessages([...base, { role: 'tutor', content: text, type, diagrams: [...figures] }])
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
          } else if (e.name === 'show_diagram') {
            const d = e.input as ShowDiagramInput
            if (d?.spec?.kind) {
              figures.push(d)
              setMessages([...base, { role: 'tutor', content: text, type, diagrams: [...figures] }])
            }
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
    return { text, failed, figures }
  }

  async function onPickPhotos(files: FileList | null) {
    if (!files?.length) return
    const room = 3 - photos.length
    const next: PreparedImage[] = []
    for (const file of Array.from(files).slice(0, Math.max(0, room))) {
      try {
        next.push(await prepareImage(file))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not read that photo.')
      }
    }
    if (next.length) setPhotos((p) => [...p, ...next].slice(0, 3))
    if (photoRef.current) photoRef.current.value = ''
  }

  async function startSession(chosenTopic: string, opts?: { resume?: boolean; focus?: string }) {
    setTopic(chosenTopic)
    setStarted(true)
    setError(null)
    const focusHint = opts?.focus ?? focus ?? undefined
    const existing = loadMessages(subject, chosenTopic)
    if (opts?.resume && !focusHint) {
      // Show the local copy immediately, then reconcile with the cloud —
      // the transcript may have been written on another device.
      if (existing.length > 0) {
        setMessages(existing)
        setLoading(false)
      }
      const remote = await loadTutorMessages(subject, chosenTopic).catch(() => null)
      if (remote && remote.length > existing.length) {
        setMessages(remote)
        persistMessages(subject, chosenTopic, remote)
      }
      if (existing.length > 0 || (remote && remote.length > 0)) {
        setLoading(false)
        return
      }
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
          profile: buildLearnerProfile(subject),
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
    if ((!input.trim() && docs.length === 0 && photos.length === 0) || loading) return
    const label =
      input.trim() ||
      (photos.length
        ? 'Here is my work — please check it.'
        : docs.length
          ? `(Attached: ${docs.map((d) => d.name).join(', ')})`
          : '')
    const userMsg: Message = {
      role: 'student',
      content: label,
      attachments: docs.map((d) => ({ name: d.name })),
      photos: photos.map((ph) => ph.preview),
    }
    const updated = [...messages, userMsg]
    setMessages(updated)
    const docsSnapshot = [...docs]
    const photoSnapshot = [...photos]
    setInput('')
    setDocs([])
    setPhotos([])
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
          messages: updated.map((m, i) =>
            i === updated.length - 1 && photoSnapshot.length
              ? {
                  ...m,
                  images: photoSnapshot.map((ph) => ({
                    mediaType: ph.mediaType,
                    data: ph.data,
                  })),
                }
              : m,
          ),
          action: 'respond',
          documents: docsSnapshot,
          clarifyUsed: clarifyUsedRef.current,
          profile: buildLearnerProfile(subject),
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
      setPhotos(photoSnapshot)
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

  // ── Topic picker ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <main className="min-h-dvh bg-paper text-ink">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
          <div className="mx-auto flex min-h-[56px] max-w-lg items-center gap-2 px-4 py-2.5">
            <Link
              href="/dashboard"
              className="press -ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted no-underline hover:bg-sunken"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-display text-[17px] text-ink">{subjectLabel}</span>
          </div>
        </header>

        <div className="mx-auto max-w-lg px-4 pb-10 pt-6">
          <div className="flex items-start gap-3.5">
            {meta && <SubjectIcon icon={meta.icon} accent={accent} size={52} tone="solid" />}
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="font-display text-[26px] leading-tight text-ink">{subjectLabel}</h1>
              <p className="text-[12.5px] uppercase tracking-wide text-ink-muted">
                {meta?.exam ?? 'WAEC · JAMB'}
              </p>
            </div>
          </div>

          {meta?.blurb && (
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{meta.blurb}</p>
          )}

          {focus && (
            <div
              className="mt-4 rounded-xl px-3.5 py-3"
              style={{
                background: `color-mix(in srgb, ${accent} 9%, transparent)`,
                borderLeft: `3px solid ${accent}`,
              }}
            >
              <p className="text-[13.5px] text-ink">
                Starting on the question you missed.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-wrong-soft px-3.5 py-3">
              <p className="text-[13.5px] text-wrong">{error}</p>
            </div>
          )}

          <p className="mt-7 margin-label">
            Choose a topic
          </p>

          {/* A contents page, not a stack of cards. These are the numbered
              topics of a syllabus, so they are set like one: hairline rules,
              serif numerals in the margin colour, and no box around each row.
              The card treatment made five topics look like five products. */}
          <ul className="mt-3 border-t border-line">
            {(meta?.topics ?? ['General foundations']).map((t, idx) => {
              const saved = !!savedTopics[t]
              return (
                <li key={t} className="border-b border-line">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void startSession(t)}
                    className="press flex w-full items-baseline gap-4 py-4 text-left disabled:opacity-60"
                  >
                    <span
                      className="tnum shrink-0 font-display text-[22px] leading-none"
                      style={{ color: accent }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1 font-display text-[19px] leading-snug text-ink">
                      {t}
                    </span>
                    {saved && (
                      <span className="shrink-0 self-center rounded-full bg-correct-soft px-2 py-0.5 text-[10.5px] font-medium text-correct">
                        In progress
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 shrink-0 self-center text-ink-faint" />
                  </button>

                  {saved && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void startSession(t, { resume: true })}
                      className="press flex w-full items-center gap-2 pb-3 text-left text-[12.5px] font-medium disabled:opacity-60"
                      style={{ color: accent }}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Resume where I left off
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </main>
    )
  }

  const canSend = Boolean(input.trim() || docs.length || photos.length) && !loading

  // ── Chat ──────────────────────────────────────────────────────────────────
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      {/* Header */}
      <header className="shrink-0 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-[56px] max-w-2xl items-center gap-2.5 px-3 py-2.5">
          <button
            type="button"
            onClick={() => {
              setStarted(false)
              setMessages([])
              setTopic(null)
              setError(null)
              setPendingWork(null)
              setSuggestedCards([])
            }}
            className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-sunken"
            aria-label="Back to topics"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {meta && <SubjectIcon icon={meta.icon} accent={accent} size={32} />}

          <div className="min-w-0 flex-1">
            <p className="truncate text-[14.5px] font-semibold leading-tight text-ink">
              {subjectLabel}
            </p>
            {topic && (
              <p className="truncate text-[12px] leading-tight text-ink-muted">{topic}</p>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-3 py-4">
          {messages.map((m, i) => {
            const isStudent = m.role === 'student'
            const streaming = loading && i === messages.length - 1 && !isStudent

            return isStudent ? (
              <div key={i} className="rise flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5">
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="mb-1.5 flex flex-wrap gap-1.5">
                      {m.attachments.map((a) => (
                        <span
                          key={a.name}
                          className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] text-on-primary"
                        >
                          <FileText className="h-3 w-3" />
                          {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {m.photos && m.photos.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {m.photos.map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={src}
                          src={src}
                          alt="Your work"
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-[15px] leading-[1.5] text-on-primary">
                    {m.content}
                  </p>
                </div>
              </div>
            ) : (
              <div key={i} className="rise flex gap-2.5">
                <EwinAvatar size={28} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1 space-y-3 pt-0.5">
                  <TutorBody text={m.content} accent={accent} streaming={streaming} />
                  {m.diagrams?.map((d, k) => (
                    <Diagram key={k} spec={d.spec} caption={d.caption} />
                  ))}
                </div>
              </div>
            )
          })}

          {loading && messages[messages.length - 1]?.role !== 'tutor' && (
            <div className="flex gap-2.5">
              <EwinAvatar size={28} className="mt-0.5 shrink-0" />
              <Thinking />
            </div>
          )}

          {/* Work the tutor assigned — a card you tap, not a redirect */}
          {pendingWork && (
            <div className="rise rounded-2xl border border-line bg-surface p-4">
              <p
                className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: accent }}
              >
                {pendingWork.kind === 'classwork' ? 'Classwork' : 'Homework'} ready
              </p>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink">{pendingWork.brief}</p>
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
                  className="press rounded-xl px-4 py-2.5 text-[13.5px] font-medium text-white"
                  style={{ background: accent }}
                >
                  Start {pendingWork.kind}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingWork(null)}
                  className="press rounded-xl border border-line px-4 py-2.5 text-[13.5px] font-medium text-ink-muted"
                >
                  Not now
                </button>
              </div>
            </div>
          )}

          {/* Cards the tutor offered */}
          {suggestedCards.length > 0 && (
            <div className="rise rounded-2xl border border-line bg-surface p-4">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Save for revision
              </p>
              <ul className="mt-2.5 space-y-2">
                {suggestedCards.map((c) => (
                  <li
                    key={c.front}
                    className="flex items-start justify-between gap-3 rounded-xl bg-sunken px-3 py-2.5"
                  >
                    <span className="min-w-0 flex-1 text-[13.5px] leading-snug text-ink">
                      {c.front}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        addCard({
                          front: c.front,
                          back: c.back,
                          subject: subjectLabel,
                          source: 'tutor',
                        })
                        setSuggestedCards((s) => s.filter((x) => x.front !== c.front))
                      }}
                      className="press shrink-0 rounded-full bg-primary px-3 py-1 text-[11.5px] font-medium text-on-primary"
                    >
                      Save
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="rise rounded-xl bg-wrong-soft px-3.5 py-3">
              <p className="text-[13.5px] text-wrong">{error}</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-line bg-paper px-3 pb-safe pt-2.5">
        <div className="mx-auto max-w-2xl">
          {docs.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {docs.map((d) => (
                <span
                  key={d.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-1 pl-2.5 pr-1 text-[12px] text-ink"
                >
                  <FileText className="h-3.5 w-3.5 text-ink-faint" />
                  <span className="max-w-[9rem] truncate">{d.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${d.name}`}
                    onClick={() => setDocs((prev) => prev.filter((x) => x.name !== d.name))}
                    className="press flex h-5 w-5 items-center justify-center rounded-full text-ink-faint hover:text-ink"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {photos.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {photos.map((ph, i) => (
                <span key={ph.preview} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ph.preview}
                    alt=""
                    className="h-16 w-16 rounded-lg border border-line object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setPhotos((p) => p.filter((_, k) => k !== i))}
                    className="press absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-paper"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => void onPickPhotos(e.target.files)}
          />

          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.csv,.json,text/plain,text/*"
            multiple
            className="hidden"
            onChange={(e) => void onPickFiles(e.target.files)}
          />

          <div className="flex items-end gap-1.5 rounded-[22px] border border-line bg-surface p-1.5 focus-within:border-primary">
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={loading || photos.length >= 3}
              className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-sunken hover:text-ink disabled:opacity-30"
              aria-label="Take a photo of your work"
            >
              <Camera className="h-[19px] w-[19px]" />
            </button>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={loading || docs.length >= 3}
              className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-sunken hover:text-ink disabled:opacity-30"
              aria-label="Attach notes"
            >
              <Plus className="h-[19px] w-[19px]" />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={photos.length ? "Add a note, or just send…" : "Answer, or ask anything…"}
              disabled={loading}
              className="max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[16px] leading-snug text-ink outline-none placeholder:text-ink-faint disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() => void send()}
              disabled={!canSend}
              className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
              style={{
                background: canSend ? 'var(--primary)' : 'var(--sunken)',
                color: canSend ? 'var(--on-primary)' : 'var(--ink-faint)',
              }}
              aria-label="Send"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
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
        </div>
      </div>
    </main>
  )
}
