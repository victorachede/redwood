export type SubjectId =
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'english'
  | 'economics'

/** Lucide icon name rendered by components/SubjectIcon.tsx */
export type SubjectIconName =
  | 'Sigma'
  | 'Atom'
  | 'FlaskConical'
  | 'Leaf'
  | 'PenLine'
  | 'TrendingUp'

export type Subject = {
  id: SubjectId
  name: string
  exam: string
  blurb: string
  topics: string[]
  /** Per-subject accent. Matched saturation/lightness so the six read as a set. */
  accent: string
  icon: SubjectIconName
}

export const SUBJECTS: Subject[] = [
  {
    id: 'mathematics',
    accent: '#3b6fd4',
    icon: 'Sigma',
    name: 'Mathematics',
    exam: 'WAEC · JAMB',
    blurb: 'From number bases to calculus — one idea at a time.',
    topics: [
      'Number & numeration',
      'Algebraic processes',
      'Geometry & mensuration',
      'Statistics & probability',
      'Trigonometry',
    ],
  },
  {
    id: 'physics',
    accent: '#7c4dd4',
    icon: 'Atom',
    name: 'Physics',
    exam: 'WAEC · JAMB',
    blurb: 'Mechanics, waves, electricity — pictured, then tested.',
    topics: ['Mechanics', 'Heat & temperature', 'Waves & sound', 'Electricity', 'Modern physics'],
  },
  {
    id: 'chemistry',
    accent: '#16a394',
    icon: 'FlaskConical',
    name: 'Chemistry',
    exam: 'WAEC · JAMB',
    blurb: 'Atoms, bonds, equations that finally make sense.',
    topics: [
      'Particulate nature of matter',
      'Periodic table',
      'Chemical reactions',
      'Acids, bases & salts',
      'Organic chemistry',
    ],
  },
  {
    id: 'biology',
    accent: '#2f9e5f',
    icon: 'Leaf',
    name: 'Biology',
    exam: 'WAEC · JAMB',
    blurb: 'Cells to systems — clear language, real examples.',
    topics: [
      'Cell biology',
      'Nutrition & digestion',
      'Transport systems',
      'Reproduction',
      'Ecology',
    ],
  },
  {
    id: 'english',
    accent: '#d4763b',
    icon: 'PenLine',
    name: 'English',
    exam: 'WAEC · JAMB',
    blurb: 'Grammar, comprehension, and writing that scores.',
    topics: [
      'Lexis & structure',
      'Comprehension',
      'Summary writing',
      'Essay & letter',
      'Oral English',
    ],
  },
  {
    id: 'economics',
    accent: '#c4485f',
    icon: 'TrendingUp',
    name: 'Economics',
    exam: 'WAEC · JAMB',
    blurb: 'Demand, supply, national income — in plain English.',
    topics: [
      'Basic economic problems',
      'Demand & supply',
      'Production',
      'Money & banking',
      'National income',
    ],
  },
]

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id)
}
