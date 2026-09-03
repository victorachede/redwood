/**
 * The generated half of the practice bank.
 *
 * The seed bank in questions.ts is hand-written and small; this is what makes
 * "unlimited practice" true. Three things matter here:
 *
 *   · Generated questions are cached on the device, so practice keeps working
 *     offline — the service worker gets you the page, this gets you the
 *     questions.
 *   · The cache is shared across students by subject/topic/exam, because a
 *     good question is not personal. Only which ones you have *seen* is.
 *   · A generation failure is never fatal. Practice falls back to the seed
 *     bank and the student never learns anything went wrong.
 */

import { readLocal, writeLocal, isCloud } from '@/app/lib/sync'
import { createBrowserClient, isSupabaseConfigured } from '@/app/lib/supabase'
import type { ExamBoard, PastQuestion } from '@/app/lib/questions'

const KEY = 'ewin-genq-v1'

type Cached = {
  /** subjectId|topic|exam */
  k: string
  at: number
  questions: PastQuestion[]
}

function cacheKey(subjectId: string, topic: string, exam: ExamBoard) {
  return `${subjectId}|${topic}|${exam}`
}

function readCache(): Cached[] {
  return readLocal<Cached[]>(KEY, [])
}

function writeCache(list: Cached[]) {
  // Bounded: a student who drills every topic should not fill their storage.
  writeLocal(KEY, list.slice(-24))
}

export function cachedQuestions(
  subjectId: string,
  topic: string,
  exam: ExamBoard,
): PastQuestion[] {
  return readCache().find((c) => c.k === cacheKey(subjectId, topic, exam))?.questions ?? []
}

/** Everything cached for a subject, whatever the topic. */
export function allCachedForSubject(subjectId: string, exam: ExamBoard): PastQuestion[] {
  const want = exam === 'ALL' ? null : exam
  return readCache()
    .filter((c) => c.k.startsWith(`${subjectId}|`))
    .flatMap((c) => c.questions)
    .filter((q) => (want ? q.exam === want : true))
}

function cache(subjectId: string, topic: string, exam: ExamBoard, questions: PastQuestion[]) {
  const k = cacheKey(subjectId, topic, exam)
  const list = readCache().filter((c) => c.k !== k)
  list.push({ k, at: Date.now(), questions })
  writeCache(list)
}

type Row = {
  id: string
  topic: string
  exam: string
  question: string
  options: Record<'A' | 'B' | 'C' | 'D', string>
  answer: string
  explanation: string
  difficulty: number
}

function toPastQuestion(r: Row, subjectId: string): PastQuestion {
  return {
    id: `gen-${r.id}`,
    subjectId,
    topic: r.topic || undefined,
    // Generated questions are written in a board's style, not lifted from a
    // real paper, so they carry the current year rather than claiming to be
    // a past question from one.
    year: new Date().getFullYear(),
    exam: r.exam as 'JAMB' | 'WAEC' | 'NECO',
    question: r.question,
    options: r.options,
    answer: r.answer as 'A' | 'B' | 'C' | 'D',
    explanation: r.explanation,
  }
}

/**
 * Reads the shared bank directly. Cheap, needs no model call, and works for
 * signed-out students because the table is readable by anon.
 */
export async function fetchBank(
  subjectId: string,
  topic: string,
  exam: ExamBoard,
): Promise<PastQuestion[]> {
  if (!isSupabaseConfigured) return []
  const sb = createBrowserClient()
  if (!sb) return []
  let q = sb
    .from('generated_questions')
    .select('id, topic, exam, question, options, answer, explanation, difficulty')
    .eq('subject_id', subjectId)
    .eq('verified', true)
    .limit(40)
  if (topic) q = q.eq('topic', topic)
  if (exam !== 'ALL') q = q.eq('exam', exam)

  const { data, error } = await q
  if (error || !data) return []
  const out = (data as unknown as Row[]).map((r) => toPastQuestion(r, subjectId))
  if (out.length && topic) cache(subjectId, topic, exam, out)
  return out
}

/**
 * Asks the server to top the bank up, generating if it is thin.
 *
 * Returns whatever it ends up with — including the empty array, which the
 * caller treats as "just use the seed bank".
 */
export async function topUpBank(input: {
  subjectId: string
  topic?: string
  exam: ExamBoard
  weakTopics?: string[]
}): Promise<PastQuestion[]> {
  try {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        subjectId: input.subjectId,
        topic: input.topic,
        exam: input.exam === 'ALL' ? undefined : input.exam,
        weakTopics: input.weakTopics,
      }),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { questions?: Row[]; topic?: string }
    const out = (data.questions ?? []).map((r) => toPastQuestion(r, input.subjectId))
    const t = data.topic || input.topic
    if (out.length && t) cache(input.subjectId, t, input.exam, out)
    return out
  } catch {
    // Offline, or generation is down. The seed bank still works.
    return []
  }
}

/** Pulls the whole subject's bank down once, so later drills work offline. */
export async function warmSubject(subjectId: string): Promise<void> {
  if (!isSupabaseConfigured) return
  await fetchBank(subjectId, '', 'ALL').then((qs) => {
    if (!qs.length) return
    const byTopic = new Map<string, PastQuestion[]>()
    for (const q of qs) {
      const t = q.topic ?? ''
      byTopic.set(t, [...(byTopic.get(t) ?? []), q])
    }
    for (const [t, list] of byTopic) {
      if (t) cache(subjectId, t, 'ALL', list)
    }
  })
}

/** True when the student's own progress is syncing, so drills can target it. */
export function canTargetWeakSpots(): boolean {
  return isCloud()
}
