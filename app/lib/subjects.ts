export type SubjectId =
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'english'
  | 'economics'

export type Subject = {
  id: SubjectId
  name: string
  blurb: string
  accent: string
  icon: string
}

export const SUBJECTS: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    blurb: 'Algebra, geometry, numbers — step by step',
    accent: '#3dd68c',
    icon: '∑',
  },
  {
    id: 'physics',
    name: 'Physics',
    blurb: 'Forces, energy, waves you can picture',
    accent: '#60a5fa',
    icon: '⚡',
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    blurb: 'Atoms, reactions, equations that click',
    accent: '#f472b6',
    icon: '⚗',
  },
  {
    id: 'biology',
    name: 'Biology',
    blurb: 'Cells, systems, life made simple',
    accent: '#34d399',
    icon: '🌿',
  },
  {
    id: 'english',
    name: 'English',
    blurb: 'Grammar, comprehension, clear writing',
    accent: '#a78bfa',
    icon: '✎',
  },
  {
    id: 'economics',
    name: 'Economics',
    blurb: 'Markets, money, how the economy moves',
    accent: '#fbbf24',
    icon: '₦',
  },
]

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id)
}
