import type Anthropic from '@anthropic-ai/sdk'

/**
 * Tool definitions for the tutor.
 *
 * These replace the prose markers the app used to scrape with regex. The model
 * now emits typed calls, so a literal "Q:" in an explanation can no longer
 * corrupt a study card and a half-streamed marker can no longer reach the UI.
 */

export const TUTOR_TOOLS: Anthropic.Tool[] = [
  {
    name: 'assign_work',
    description:
      'Assign classwork or homework. Use classwork after the student answers two or three check questions correctly in a row. Use homework at a natural stopping point, or on a weakness worth drilling at home. Call at most once per reply, and only when the student has actually earned it — not to fill space.',
    input_schema: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          enum: ['classwork', 'homework'],
          description: 'classwork for immediate practice, homework to do later',
        },
        brief: {
          type: 'string',
          description: 'One short sentence naming exactly what to practise.',
        },
        topic: { type: 'string', description: 'Syllabus topic this covers.' },
      },
      required: ['kind', 'brief'],
    },
  },
  {
    name: 'save_study_card',
    description:
      'Save a revision card for a crisp, self-contained fact — a definition, a formula, a key distinction. Use it when the student has just struggled with or nailed such a fact. Never for whole worked examples. At most two per reply.',
    input_schema: {
      type: 'object',
      properties: {
        front: { type: 'string', description: 'The question or prompt side.' },
        back: { type: 'string', description: 'The answer side. One or two lines.' },
      },
      required: ['front', 'back'],
    },
  },
  {
    name: 'record_mastery',
    description:
      "Record how the student is doing on a topic, so future sessions can pick up where this one left off. Call it when you have real evidence from their answers — not a guess. This is the app's memory: it is how you will know next week what tripped them up today.",
    input_schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Syllabus topic being judged.' },
        level: {
          type: 'string',
          enum: ['struggling', 'developing', 'solid'],
          description: 'Level demonstrated by their answers in this session.',
        },
      },
      required: ['topic', 'level'],
    },
  },
  {
    name: 'ask_clarifying',
    description:
      'Ask ONE clarifying question before teaching — only when the answer would genuinely change how you explain (which exam board, which part they are stuck on, what they have already covered). Do not use it as a greeting, and never more than once in a conversation. If you can make a sensible assumption, do that instead and say what you assumed.',
    input_schema: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'The single question to ask.' },
        options: {
          type: 'array',
          items: { type: 'string' },
          description: 'Two to four tappable answers, when the choice is closed.',
        },
      },
      required: ['question'],
    },
  },
  {
    name: 'show_diagram',
    description:
      'Draw a diagram when a picture explains faster than a sentence — a number line for inequalities, a triangle for trigonometry, force arrows for mechanics, a sketched graph, a bar chart. Only when it genuinely helps.',
    input_schema: {
      type: 'object',
      properties: {
        spec: {
          type: 'object',
          description: 'The diagram to draw. Shape depends on kind.',
          properties: {
            kind: {
              type: 'string',
              enum: ['numberline', 'triangle', 'forces', 'graph', 'bar'],
            },
            min: { type: 'number' },
            max: { type: 'number' },
            marks: { type: 'array', items: { type: 'number' } },
            a: { type: 'number' },
            b: { type: 'number' },
            c: { type: 'number' },
            m: { type: 'number' },
            angle: { type: 'number' },
            expression: { type: 'string', enum: ['linear', 'quadratic'] },
            vectors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  dx: { type: 'number' },
                  dy: { type: 'number' },
                },
                required: ['label', 'dx', 'dy'],
              },
            },
            bars: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  value: { type: 'number' },
                },
                required: ['label', 'value'],
              },
            },
            label: { type: 'string' },
          },
          required: ['kind'],
        },
        caption: { type: 'string', description: 'One short line under the figure.' },
      },
      required: ['spec'],
    },
  },
]

/** Tools available while grading pasted or photographed work. */
export const WORK_TOOL_NAMES = new Set(['save_study_card', 'record_mastery', 'show_diagram'])

export const WORK_TOOLS: Anthropic.Tool[] = TUTOR_TOOLS.filter((t) =>
  WORK_TOOL_NAMES.has(t.name),
)
