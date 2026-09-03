import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/supabase'
import { getSubject } from '@/app/lib/subjects'
import {
  QUESTION_TOOL,
  SOLVE_TOOL,
  validateQuestion,
  examStyle,
  type GeneratedQuestion,
} from '@/app/lib/questionGen'
import type { ExamBoard } from '@/app/lib/questions'

export const maxDuration = 120

/* ═══════════════════════════════════════════════════════════════════════════
   Practice question generation.

   The seed bank held 36 questions across six subjects — five to seven each —
   while Pro sold "timed full mocks" and "unlimited practice". A JAMB paper is
   forty questions in one subject. This closes that gap.

   Three decisions shape the whole route:

   1. The bank is SHARED, not per-student. A good question about Trigonometry
      in WAEC style is equally good for everyone, so one generation serves the
      whole user base. Per-student generation would multiply cost by user
      count and buy nothing.

   2. Nothing is served until a SECOND, INDEPENDENT PASS agrees with the
      answer key. The first pass writes questions and marks its own homework,
      which is exactly the situation where a plausible wrong key survives. The
      verifier sees only the stem and the options — never the proposed answer
      — and anything it disagrees with, or flags as ambiguous, is thrown away.
      A wrong answer taught confidently to someone revising for WAEC is worse
      than having no question at all, and this is the cheapest possible
      insurance against it.

   3. Generation happens server-side with the service role. Students read the
      bank and can never write to it: a practice bank anyone can insert into
      is a practice bank that teaches wrong answers.
   ═══════════════════════════════════════════════════════════════════════════ */

const MODEL = 'claude-sonnet-4-5'
/** Asked for per batch. Verification then removes whatever did not hold up. */
const BATCH = 8
/** Refuse to spend a generation when the bank is already deep enough. */
const ENOUGH = 24

type Body = {
  subjectId: string
  topic?: string
  exam?: ExamBoard
  /** Topics the student has actually got wrong, so a drill can target them. */
  weakTopics?: string[]
}

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY
  const sb = createServiceClient()

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const subject = getSubject(body.subjectId)
  if (!subject) return NextResponse.json({ error: 'Unknown subject' }, { status: 400 })

  const exam: ExamBoard = body.exam && body.exam !== 'ALL' ? body.exam : 'WAEC'
  const topic =
    body.topic && subject.topics.includes(body.topic)
      ? body.topic
      : pick(body.weakTopics?.filter((t) => subject.topics.includes(t)) ?? subject.topics)

  if (!sb) {
    return NextResponse.json({ error: 'Question bank is not configured.' }, { status: 503 })
  }

  // Already deep enough? Serve what exists rather than paying to generate.
  const existing = await readBank(sb, body.subjectId, topic, exam)
  if (existing.length >= ENOUGH || !key) {
    if (!key && existing.length === 0) {
      return NextResponse.json(
        { error: 'Question generation is not set up yet.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ questions: existing, generated: 0 })
  }

  const client = new Anthropic({ apiKey: key })

  try {
    const drafted = await draft(client, subject.name, topic, exam, existing.map((q) => q.question))
    if (!drafted.length) {
      return NextResponse.json({ questions: existing, generated: 0 })
    }

    const kept = await verify(client, subject.name, drafted)

    if (kept.length) {
      // Ignore duplicates rather than failing the batch: two students hitting
      // the same thin topic at once is normal, not an error.
      await sb.from('generated_questions').upsert(
        kept.map((q) => ({
          subject_id: body.subjectId,
          topic,
          exam,
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          verified: true,
        })),
        { onConflict: 'subject_id,question_key', ignoreDuplicates: true },
      )
    }

    const fresh = await readBank(sb, body.subjectId, topic, exam)
    return NextResponse.json({
      questions: fresh.length ? fresh : existing,
      generated: kept.length,
      rejected: drafted.length - kept.length,
      topic,
    })
  } catch (err) {
    console.error('[questions] generation failed', err)
    // A generation failure must never break practice — the seed bank and
    // whatever is already generated still work.
    return NextResponse.json({ questions: existing, generated: 0 })
  }
}

/* ── Bank ─────────────────────────────────────────────────────────────── */

type BankRow = {
  id: string
  topic: string
  exam: string
  question: string
  options: Record<'A' | 'B' | 'C' | 'D', string>
  answer: string
  explanation: string
  difficulty: number
}

async function readBank(
  sb: NonNullable<ReturnType<typeof createServiceClient>>,
  subjectId: string,
  topic: string,
  exam: ExamBoard,
) {
  const { data } = await sb
    .from('generated_questions')
    .select('id, topic, exam, question, options, answer, explanation, difficulty')
    .eq('subject_id', subjectId)
    .eq('topic', topic)
    .eq('exam', exam)
    .eq('verified', true)
    .order('created_at', { ascending: false })
    .limit(40)
  return (data ?? []) as unknown as BankRow[]
}

/* ── Pass one: write ──────────────────────────────────────────────────── */

async function draft(
  client: Anthropic,
  subjectName: string,
  topic: string,
  exam: ExamBoard,
  avoid: string[],
): Promise<GeneratedQuestion[]> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    tools: [QUESTION_TOOL],
    tool_choice: { type: 'tool', name: QUESTION_TOOL.name },
    system: [
      {
        type: 'text',
        text: `You write objective questions for Nigerian senior secondary exams.

Non-negotiable:
- Exactly one option is correct. The other three must be wrong, not arguable.
- Distractors are the answers a student actually arrives at by making a specific mistake — a sign error, using diameter for radius, forgetting a unit conversion. Never filler and never random numbers.
- The explanation shows the working that gets you there. It is what the student reads after getting it wrong, so "The answer is B" is worthless.
- Stay inside the senior secondary syllabus. No university content.
- Plain text. No markdown, no LaTeX. Write powers as 2³ and fractions as 3/4.
- Nigerian context where it fits naturally — naira, local place names, familiar situations. Never forced.
- Vary difficulty across the batch: some one-step, some needing two or three.`,
        cache_control: { type: 'ephemeral' as const },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Subject: ${subjectName}
Topic: ${topic}
Board: ${exam}

Style: ${examStyle(exam)}

Write ${BATCH} questions.${
          avoid.length
            ? `\n\nThe bank already has these, so do not repeat them or write near-identical variants:\n${avoid
                .slice(0, 20)
                .map((q) => `- ${q}`)
                .join('\n')}`
            : ''
        }`,
      },
    ],
  })

  const block = res.content.find((b) => b.type === 'tool_use')
  if (!block || block.type !== 'tool_use') return []
  const raw = (block.input as { questions?: unknown[] })?.questions
  if (!Array.isArray(raw)) return []

  const out: GeneratedQuestion[] = []
  const seen = new Set(avoid.map((q) => q.toLowerCase().trim()))
  for (const item of raw) {
    const v = validateQuestion(item)
    if (!v.ok) {
      console.warn('[questions] rejected at validation:', v.why)
      continue
    }
    const k = v.value.question.toLowerCase().trim()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(v.value)
  }
  return out
}

/* ── Pass two: solve it blind ─────────────────────────────────────────── */

/**
 * Re-solves each question with the answer key withheld.
 *
 * This is the step that makes the bank trustworthy. A model marking its own
 * work will confirm its own mistake; a model solving cold has to actually get
 * there. Anything where the two disagree, or that the solver flags as
 * ambiguous, is dropped rather than fixed — a question that needed rescuing
 * is not a question worth putting in front of someone revising.
 */
async function verify(
  client: Anthropic,
  subjectName: string,
  drafted: GeneratedQuestion[],
): Promise<GeneratedQuestion[]> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    tools: [SOLVE_TOOL],
    tool_choice: { type: 'tool', name: SOLVE_TOOL.name },
    system:
      'You are marking a colleague\'s draft exam paper. Solve each question yourself, from scratch. If a question has no correct option, more than one correct option, or is ambiguous, answer with your best guess but set confident to false.',
    messages: [
      {
        role: 'user',
        content: `Subject: ${subjectName}

${drafted
  .map(
    (q, i) => `${i}. ${q.question}
A. ${q.options.A}
B. ${q.options.B}
C. ${q.options.C}
D. ${q.options.D}`,
  )
  .join('\n\n')}`,
      },
    ],
  })

  const block = res.content.find((b) => b.type === 'tool_use')
  if (!block || block.type !== 'tool_use') return []
  const answers = (block.input as { answers?: { index: number; answer: string; confident: boolean }[] })
    ?.answers
  if (!Array.isArray(answers)) return []

  const byIndex = new Map(answers.map((a) => [a.index, a]))
  return drafted.filter((q, i) => {
    const a = byIndex.get(i)
    if (!a) return false
    if (!a.confident) return false
    return a.answer === q.answer
  })
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}
