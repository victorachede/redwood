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

/* ═══════════════════════════════════════════════════════════════════════════
   Voice call tools

   On a call the tutor works at a whiteboard while it talks. These four tools
   are the board; app/lib/callBoard.ts says what each one does to it. The
   call also keeps the tools that save what was learned, so a call ends the
   way a chat does: mastery recorded, homework set, a card saved.
   ═══════════════════════════════════════════════════════════════════════════ */

export const BOARD_TOOLS: Anthropic.Tool[] = [
  {
    name: 'write_step',
    description:
      "Write one line on the whiteboard as you say it: a rule, a step of working, the question you are setting, or the student's spoken answer copied up so you can mark it. Short lines, one step each, written the way a student would write them in an exam booklet.",
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Your own short id for the line, so you can mark it later. Reusing an id rewrites that line.' },
        text: { type: 'string', description: 'The line itself, at most 80 characters. Use the real minus sign − and × for times.' },
        by: {
          type: 'string',
          enum: ['ewin', 'student', 'question'],
          description: "ewin for your own steps, student for the student's answer, question for the problem you set.",
        },
      },
      required: ['id', 'text'],
    },
  },
  {
    name: 'mark_step',
    description:
      'Mark a line already on the board, the way a teacher marks a script: tick a right line, cross a wrong one, circle the exact part that broke, add a two- or three-word note, or strike a line out once it has been corrected. Circle the smallest piece that is wrong, never the whole line.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The id of the line to mark.' },
        mark: { type: 'string', enum: ['tick', 'cross'] },
        circle: { type: 'string', description: 'Text to circle. Must appear exactly as written in that line.' },
        note: { type: 'string', description: 'A short pen note beside the line, like "sign?"' },
        strike: { type: 'boolean', description: 'Strike the line out after it has been corrected.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'clear_board',
    description: 'Wipe the board before a new part of the lesson, optionally with a new heading.',
    input_schema: {
      type: 'object',
      properties: { title: { type: 'string', description: 'Heading for the fresh board, a few words.' } },
    },
  },
  {
    name: 'set_phase',
    description:
      'Move the lesson to its next part. Every call runs warm_up, teach, your_turn, check, recap in that order; the student sees where they are. On recap, pass the one rule to remember.',
    input_schema: {
      type: 'object',
      properties: {
        phase: { type: 'string', enum: ['warm_up', 'teach', 'your_turn', 'check', 'recap'] },
        recap: { type: 'string', description: 'Only with recap: the one rule from today, in a sentence.' },
      },
      required: ['phase'],
    },
  },
]

const CALL_KEEPS = new Set(['show_diagram', 'record_mastery', 'assign_work', 'save_study_card'])

/** Everything the tutor can use on a voice call. */
export const CALL_TOOLS: Anthropic.Tool[] = [
  ...BOARD_TOOLS,
  ...TUTOR_TOOLS.filter((t) => CALL_KEEPS.has(t.name)),
]
