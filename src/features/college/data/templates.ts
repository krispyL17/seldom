import type { AiRecommendation, FinancialAidItem } from '../types'

function parseGradYear(graduationYear?: string | null): number | null {
  const year = Number(graduationYear)
  return Number.isFinite(year) && year >= 2000 && year <= 2100 ? year : null
}

function dateForGradYear(gradYear: number | null, month: number, day: number, yearsBeforeGrad: number): string | null {
  if (gradYear == null) return null
  const y = gradYear - yearsBeforeGrad
  return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Prep-season financial planning checklist — dates relative to graduation year when known. */
export function buildJuniorFinancialAid(graduationYear?: string | null): FinancialAidItem[] {
  const gradYear = parseGradYear(graduationYear)
  return [
    { id: 'fa-j1', label: 'Review net price calculators', completed: false, dueDate: null },
    {
      id: 'fa-j2',
      label: 'Learn EFC / SAI basics with parents',
      completed: false,
      dueDate: dateForGradYear(gradYear, 8, 15, 1),
    },
    {
      id: 'fa-j3',
      label: 'Compare in-state vs out-of-state cost',
      completed: false,
      dueDate: dateForGradYear(gradYear, 9, 1, 1),
    },
    {
      id: 'fa-j4',
      label: 'Research merit aid policies',
      completed: false,
      dueDate: dateForGradYear(gradYear, 10, 1, 1),
    },
    { id: 'fa-j5', label: 'Start college savings conversation', completed: false, dueDate: null },
  ]
}

/** Senior application-season financial aid checklist. */
export function buildSeniorFinancialAid(graduationYear?: string | null): FinancialAidItem[] {
  const gradYear = parseGradYear(graduationYear)
  return [
    {
      id: 'fa-s1',
      label: 'Complete FAFSA',
      completed: false,
      dueDate: dateForGradYear(gradYear, 10, 1, 1),
    },
    {
      id: 'fa-s2',
      label: 'CSS Profile (if required)',
      completed: false,
      dueDate: dateForGradYear(gradYear, 11, 1, 1),
    },
    { id: 'fa-s3', label: 'Review net price calculators', completed: false, dueDate: null },
    { id: 'fa-s4', label: 'Compare aid packages', completed: false, dueDate: null },
    {
      id: 'fa-s5',
      label: 'Research merit scholarships',
      completed: false,
      dueDate: dateForGradYear(gradYear, 9, 15, 1),
    },
  ]
}

export function buildStarterRecommendations(): AiRecommendation[] {
  return []
}

export function inferApplicationPhase(graduationYear?: string | null): 'junior' | 'senior' {
  const gradYear = parseGradYear(graduationYear)
  if (gradYear == null) return 'junior'
  const now = new Date()
  const seniorFallStart = new Date(gradYear - 1, 7, 1)
  return now >= seniorFallStart ? 'senior' : 'junior'
}
