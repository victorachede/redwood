/**
 * Shape and validation for generated practice questions.
 *
 * Kept apart from the route so the validation can be tested without a model
 * call — which matters, because validation is the only thing standing between
 * a student and a confidently-taught wrong answer.
 */

import type { ExamBoard } from '@/app/lib/questions'

export type GeneratedQuestion = {
  question: string
  options: Record<'A' | 'B' | 'C' | 'D', string>
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  /** 1 easy … 3 hard */
  difficulty: number
}

export const LETTERS = ['A', 'B', 'C', 'D'] as const

/** The tool the model fills in, so structure never has to be parsed out of prose. */
export const QUESTION_TOOL = {
  name: 'submit_questions',
  description:
    'Submit the batch of exam questions. Call exactly once, with every question you wrote.',
  input_schema: {
    type: 'object' as const,
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string', description: 'The question stem.' },
            options: {
              type: 'object',
              properties: {
                A: { type: 'string' },
                B: { type: 'string' },
                C: { type: 'string' },
                D: { type: 'string' },
              },
              required: ['A', 'B', 'C', 'D'],
            },
            answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
            explanation: {
              type: 'string',
              description:
                'The worked steps, not a restatement of the answer. Two or three sentences.',
            },
            difficulty: { type: 'integer', minimum: 1, maximum: 3 },
          },
          required: ['question', 'options', 'answer', 'explanation', 'difficulty'],
        },
      },
    },
    required: ['questions'],
  },
}

/** The independent solver's tool — it never sees the proposed answer key. */
export const SOLVE_TOOL = {
  name: 'submit_answers',
  description: 'Give your own answer to each question, in order.',
  input_schema: {
    type: 'object' as const,
    properties: {
      answers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            index: { type: 'integer' },
            answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
            confident: {
              type: 'boolean',
              description:
                'False if the question is ambiguous, has no correct option, or has more than one.',
            },
          },
          required: ['index', 'answer', 'confident'],
        },
      },
    },
    required: ['answers'],
  },
}

export type Rejection = { question: string; why: string }

/**
 * Structural validation, before anything is worth spending a solve on.
 *
 * Every rule here is a way a generated question can be quietly broken while
 * still looking fine in a UI: four options where two are the same word, an
 * answer key pointing at an empty string, an "explanation" that just repeats
 * the letter. A student sitting WAEC cannot tell any of these from a good
 * question, which is exactly why the code has to.
 */
export function validateQuestion(q: unknown): { ok: true; value: GeneratedQuestion } | { ok: false; why: string } {
  if (!q || typeof q !== 'object') return { ok: false, why: 'not an object' }
  const c = q as Record<string, unknown>

  const question = typeof c.question === 'string' ? c.question.trim() : ''
  if (question.length < 12) return { ok: false, why: 'question too short to be real' }

  const opts = c.options
  if (!opts || typeof opts !== 'object') return { ok: false, why: 'no options' }
  const o = opts as Record<string, unknown>

  const values: string[] = []
  for (const L of LETTERS) {
    const v = typeof o[L] === 'string' ? (o[L] as string).trim() : ''
    if (!v) return { ok: false, why: `option ${L} is empty` }
    values.push(v)
  }

  // Duplicate options make the question unanswerable even when the key is right.
  const seen = new Set(values.map((v) => v.toLowerCase()))
  if (seen.size !== 4) return { ok: false, why: 'duplicate options' }

  const answer = typeof c.answer === 'string' ? c.answer.trim().toUpperCase() : ''
  if (!LETTERS.includes(answer as (typeof LETTERS)[number])) {
    return { ok: false, why: 'answer is not A-D' }
  }

  const explanation = typeof c.explanation === 'string' ? c.explanation.trim() : ''
  if (explanation.length < 20) return { ok: false, why: 'explanation too thin to teach anything' }
  // "The answer is B." explains nothing; the whole point is the working.
  if (/^(the )?(correct )?(answer|option)\s+is\s+[A-D]\.?$/i.test(explanation)) {
    return { ok: false, why: 'explanation restates the answer' }
  }

  const difficulty = Number(c.difficulty)
  const d = Number.isFinite(difficulty) ? Math.min(3, Math.max(1, Math.round(difficulty))) : 2

  return {
    ok: true,
    value: {
      question,
      options: { A: values[0], B: values[1], C: values[2], D: values[3] },
      answer: answer as 'A' | 'B' | 'C' | 'D',
      explanation,
      difficulty: d,
    },
  }
}

/** Board-specific voice. A WAEC stem does not read like a JAMB one. */
export function examStyle(exam: ExamBoard): string {
  switch (exam) {
    case 'JAMB':
      return 'JAMB CBT objectives: short, computational, one clean step or two. Distractors are the answers you get from the common slips — sign errors, using diameter for radius, forgetting to convert units.'
    case 'WAEC':
      return 'WAEC objectives: slightly longer stems, more words, often set in a described situation. Distractors reflect real misconceptions, not random numbers.'
    case 'NECO':
      return 'NECO objectives: close to WAEC in shape, plain wording, straightforward recall and application.'
    default:
      return 'Nigerian senior secondary objective questions.'
  }
}
