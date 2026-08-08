import type { ApplicationPhase, CollegeDeadline } from '../types'

function dateY(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Infer high-school graduation year from application phase and current date. */
export function inferGraduationYear(phase: ApplicationPhase = 'junior'): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  // Aug–Dec: next June graduation for current seniors; Jan–Jul: current calendar year graduation.
  if (phase === 'senior') {
    return month >= 7 ? year + 1 : year
  }
  return month >= 7 ? year + 2 : year + 1
}

/**
 * Typical US admission cycle placeholders for a school (dates vary by institution).
 * `graduationYear` = high school class year (e.g. 2027).
 */
export function buildStandardAdmissionDeadlines(graduationYear: number): CollegeDeadline[] {
  const applyFallYear = graduationYear - 1

  return [
    {
      id: 'std-fafsa-open',
      label: 'FAFSA opens',
      date: dateY(applyFallYear, 10, 1),
      type: 'financial_aid',
    },
    {
      id: 'std-ea-ed',
      label: 'Early Action / Early Decision (typical)',
      date: dateY(applyFallYear, 11, 1),
      type: 'application',
    },
    {
      id: 'std-rd',
      label: 'Regular Decision (typical)',
      date: dateY(graduationYear, 1, 1),
      type: 'application',
    },
    {
      id: 'std-aid-priority',
      label: 'Financial aid priority deadline (check school)',
      date: dateY(graduationYear, 2, 1),
      type: 'financial_aid',
    },
    {
      id: 'std-ivy-day',
      label: 'Ivy Day',
      date: dateY(graduationYear, 3, 27),
      type: 'other',
    },
    {
      id: 'std-decisions',
      label: 'Regular decision release (typical)',
      date: dateY(graduationYear, 3, 28),
      type: 'other',
    },
    {
      id: 'std-commit',
      label: 'National College Decision Day',
      date: dateY(graduationYear, 5, 1),
      type: 'other',
    },
  ]
}

/** Fresh ids when seeding so multiple colleges do not share row ids in UI keys. */
export function buildStandardAdmissionDeadlinesForCollege(
  graduationYear: number,
): CollegeDeadline[] {
  return buildStandardAdmissionDeadlines(graduationYear).map((d) => ({
    ...d,
    id: `${d.id}-${crypto.randomUUID().slice(0, 8)}`,
  }))
}

export function isResultMilestoneDeadline(deadline: CollegeDeadline): boolean {
  return (
    deadline.id.startsWith('std-ivy-day') ||
    deadline.id.startsWith('std-decisions') ||
    deadline.id.startsWith('std-commit') ||
    deadline.label.toLowerCase().includes('ivy day') ||
    deadline.label.toLowerCase().includes('decision release') ||
    deadline.label.toLowerCase().includes('decision day')
  )
}

/** Shared cycle deadlines use ids like `std-fafsa-open-abc12345`. */
export function globalDeadlineKey(deadline: CollegeDeadline): string | null {
  if (!deadline.id.startsWith('std-')) return null
  const baseId = deadline.id.replace(/-[a-f0-9]{8}$/i, '')
  return `${baseId}|${deadline.date}`
}

export function isGlobalStandardDeadline(deadline: CollegeDeadline): boolean {
  return globalDeadlineKey(deadline) !== null
}
