/** Seed past questions — expand over time. Shape mirrors CardStack mock. */

export type PastQuestion = {
  id: string
  subjectId: string
  year: number
  exam: 'JAMB' | 'WAEC' | 'NECO'
  question: string
  options: Record<'A' | 'B' | 'C' | 'D', string>
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export const PAST_QUESTIONS: PastQuestion[] = [
  {
    id: 'mth-001',
    subjectId: 'mathematics',
    year: 2023,
    exam: 'JAMB',
    question: 'If 2x + 5 = 17, what is the value of x?',
    options: { A: '4', B: '6', C: '8', D: '12' },
    answer: 'B',
    explanation: '2x + 5 = 17 → 2x = 12 → x = 6.',
  },
  {
    id: 'mth-002',
    subjectId: 'mathematics',
    year: 2022,
    exam: 'WAEC',
    question: 'The mean of 3, 5, 7, 9 is:',
    options: { A: '5', B: '6', C: '7', D: '8' },
    answer: 'B',
    explanation: 'Sum = 24, count = 4, mean = 24/4 = 6.',
  },
  {
    id: 'mth-003',
    subjectId: 'mathematics',
    year: 2021,
    exam: 'JAMB',
    question: 'Simplify: 2³ × 2²',
    options: { A: '2⁵', B: '2⁶', C: '4⁵', D: '2' },
    answer: 'A',
    explanation: 'Same base: add exponents. 2³ × 2² = 2⁵.',
  },
  {
    id: 'phy-001',
    subjectId: 'physics',
    year: 2023,
    exam: 'JAMB',
    question: 'The S.I. unit of force is the:',
    options: { A: 'Joule', B: 'Watt', C: 'Newton', D: 'Pascal' },
    answer: 'C',
    explanation: 'Force is measured in newtons (N). Joule is energy, watt is power, pascal is pressure.',
  },
  {
    id: 'phy-002',
    subjectId: 'physics',
    year: 2022,
    exam: 'WAEC',
    question: 'Which of the following is a vector quantity?',
    options: { A: 'Mass', B: 'Temperature', C: 'Velocity', D: 'Time' },
    answer: 'C',
    explanation: 'Velocity has magnitude and direction. Mass, temperature, and time are scalars.',
  },
  {
    id: 'phy-003',
    subjectId: 'physics',
    year: 2021,
    exam: 'JAMB',
    question: 'Light travels fastest in:',
    options: { A: 'Glass', B: 'Water', C: 'Air', D: 'Vacuum' },
    answer: 'D',
    explanation: 'The speed of light is maximum in a vacuum (~3 × 10⁸ m/s).',
  },
  {
    id: 'chm-001',
    subjectId: 'chemistry',
    year: 2023,
    exam: 'JAMB',
    question: 'The atomic number of an element is the number of:',
    options: { A: 'Neutrons', B: 'Protons', C: 'Electrons + neutrons', D: 'Nucleons' },
    answer: 'B',
    explanation: 'Atomic number = number of protons in the nucleus.',
  },
  {
    id: 'chm-002',
    subjectId: 'chemistry',
    year: 2022,
    exam: 'WAEC',
    question: 'A Brønsted-Lowry acid is a substance that:',
    options: {
      A: 'Accepts protons',
      B: 'Donates protons',
      C: 'Donates electrons',
      D: 'Accepts electrons',
    },
    answer: 'B',
    explanation: 'Brønsted-Lowry acid = proton (H⁺) donor.',
  },
  {
    id: 'chm-003',
    subjectId: 'chemistry',
    year: 2021,
    exam: 'JAMB',
    question: 'The process of converting a liquid to a gas is called:',
    options: { A: 'Condensation', B: 'Sublimation', C: 'Evaporation', D: 'Deposition' },
    answer: 'C',
    explanation: 'Evaporation is liquid → gas. Condensation is the reverse.',
  },
  {
    id: 'bio-001',
    subjectId: 'biology',
    year: 2023,
    exam: 'JAMB',
    question: 'The powerhouse of the cell is the:',
    options: { A: 'Nucleus', B: 'Ribosome', C: 'Mitochondria', D: 'Golgi apparatus' },
    answer: 'C',
    explanation: 'Mitochondria produce ATP — the cell’s energy currency.',
  },
  {
    id: 'bio-002',
    subjectId: 'biology',
    year: 2022,
    exam: 'WAEC',
    question: 'Photosynthesis takes place in the:',
    options: { A: 'Mitochondria', B: 'Chloroplast', C: 'Nucleus', D: 'Ribosome' },
    answer: 'B',
    explanation: 'Chloroplasts contain chlorophyll and are the site of photosynthesis.',
  },
  {
    id: 'bio-003',
    subjectId: 'biology',
    year: 2021,
    exam: 'JAMB',
    question: 'Which blood group is the universal donor?',
    options: { A: 'A', B: 'B', C: 'AB', D: 'O' },
    answer: 'D',
    explanation: 'Group O can generally donate to other ABO groups in emergencies.',
  },
  {
    id: 'eng-001',
    subjectId: 'english',
    year: 2023,
    exam: 'JAMB',
    question: 'Choose the option nearest in meaning to “abundant”:',
    options: { A: 'Scarce', B: 'Plentiful', C: 'Empty', D: 'Rare' },
    answer: 'B',
    explanation: 'Abundant means plentiful or more than enough.',
  },
  {
    id: 'eng-002',
    subjectId: 'english',
    year: 2022,
    exam: 'WAEC',
    question: 'The opposite of “generous” is:',
    options: { A: 'Kind', B: 'Stingy', C: 'Wealthy', D: 'Friendly' },
    answer: 'B',
    explanation: 'Generous means giving freely; stingy means unwilling to give.',
  },
  {
    id: 'eco-001',
    subjectId: 'economics',
    year: 2023,
    exam: 'JAMB',
    question: 'Demand for a commodity is said to be elastic when:',
    options: {
      A: 'Price change has little effect on quantity demanded',
      B: 'Quantity demanded changes a lot when price changes',
      C: 'Supply is fixed',
      D: 'Income is zero',
    },
    answer: 'B',
    explanation: 'Elastic demand: quantity demanded responds strongly to price changes.',
  },
  {
    id: 'eco-002',
    subjectId: 'economics',
    year: 2022,
    exam: 'WAEC',
    question: 'The basic economic problem is:',
    options: {
      A: 'Inflation',
      B: 'Scarcity',
      C: 'Unemployment',
      D: 'Taxation',
    },
    answer: 'B',
    explanation: 'Scarcity — limited resources vs unlimited wants — is the core problem of economics.',
  },
]

export function questionsForSubject(subjectId: string): PastQuestion[] {
  return PAST_QUESTIONS.filter((q) => q.subjectId === subjectId)
}
