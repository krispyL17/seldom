import type {
  Activity,
  ApplicationStatus,
  Award,
  ChecklistItem,
  College,
  CollegeDashboardStats,
  CollegeDeadline,
  CollegeUserData,
  EssayDraftStatus,
  Project,
  RecommendationLetter,
  Scholarship,
  ScholarshipStatus,
  TimelineEntry,
} from './types'

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  researching: 'Researching',
  planning: 'Planning',
  applying: 'Applying',
  submitted: 'Submitted',
  waiting: 'Waiting',
  accepted: 'Accepted',
  rejected: 'Rejected',
  committed: 'Committed',
}

const STATUS_VARIANTS: Record<
  ApplicationStatus,
  'default' | 'success' | 'warning' | 'danger' | 'accent' | 'muted'
> = {
  researching: 'muted',
  planning: 'default',
  applying: 'accent',
  submitted: 'accent',
  waiting: 'warning',
  accepted: 'success',
  rejected: 'danger',
  committed: 'success',
}

const ESSAY_STATUS_LABELS: Record<EssayDraftStatus, string> = {
  not_started: 'Not Started',
  outline: 'Outline',
  draft: 'Draft',
  revision: 'Revision',
  final: 'Final',
}

const SCHOLARSHIP_STATUS_LABELS: Record<ScholarshipStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  awarded: 'Awarded',
  rejected: 'Rejected',
}

export function statusLabel(status: ApplicationStatus): string {
  return STATUS_LABELS[status]
}

export function statusBadgeVariant(status: ApplicationStatus) {
  return STATUS_VARIANTS[status]
}

export function essayStatusLabel(status: EssayDraftStatus): string {
  return ESSAY_STATUS_LABELS[status]
}

export function scholarshipStatusLabel(status: ScholarshipStatus): string {
  return SCHOLARSHIP_STATUS_LABELS[status]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'Present'
  if (start && !end) return `${formatShortDate(start)} – Present`
  if (!start && end) return formatShortDate(end)
  return `${formatShortDate(start!)} – ${formatShortDate(end!)}`
}

export function daysUntil(date: string): number {
  const target = new Date(`${date}T12:00:00`)
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function isOverdue(date: string): boolean {
  return daysUntil(date) < 0
}

export function checklistProgress(checklist: ChecklistItem[]): number {
  if (checklist.length === 0) return 0
  const done = checklist.filter((item) => item.completed).length
  return Math.round((done / checklist.length) * 100)
}

export function collegeProgress(college: College): number {
  return checklistProgress(college.checklist)
}

export function overallProgress(colleges: College[]): number {
  if (colleges.length === 0) return 0
  const total = colleges.reduce((sum, c) => sum + collegeProgress(c), 0)
  return Math.round(total / colleges.length)
}

export function averageAcceptanceRate(colleges: College[]): number {
  const withRate = colleges.filter((c) => c.acceptanceRate != null)
  if (withRate.length === 0) return 0
  const total = withRate.reduce((sum, c) => sum + (c.acceptanceRate ?? 0), 0)
  return Math.round(total / withRate.length)
}

export function getUpcomingDeadlines(
  deadlines: CollegeDeadline[],
  limit = 5,
): CollegeDeadline[] {
  return [...deadlines]
    .filter((d) => daysUntil(d.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
}

export function getAllDeadlines(colleges: College[]): (CollegeDeadline & { collegeName: string })[] {
  return colleges.flatMap((college) =>
    college.deadlines.map((deadline) => ({
      ...deadline,
      collegeName: college.name,
    })),
  )
}

export function getCollegeById(colleges: College[], id: string): College | undefined {
  return colleges.find((c) => c.id === id)
}

export function progressVariant(progress: number): 'accent' | 'success' | 'warning' | 'danger' {
  if (progress >= 80) return 'success'
  if (progress >= 50) return 'accent'
  if (progress >= 25) return 'warning'
  return 'danger'
}

export function deadlineUrgencyVariant(days: number): 'danger' | 'warning' | 'accent' | 'muted' {
  if (days < 0) return 'danger'
  if (days <= 7) return 'danger'
  if (days <= 14) return 'warning'
  if (days <= 30) return 'accent'
  return 'muted'
}

export function computeDashboardStats(
  colleges: College[],
  recommendations: RecommendationLetter[],
  scholarships: Scholarship[],
): CollegeDashboardStats {
  const allEssays = colleges.flatMap((c) => c.essays)
  const essaysInProgress = allEssays.filter(
    (e) => e.status !== 'final' && e.status !== 'not_started',
  ).length
  const recommendationsComplete = recommendations.filter((r) => r.status === 'submitted').length
  const applicationsCompleted = colleges.filter(
    (c) => c.checklist.find((item) => item.key === 'application_submitted')?.completed,
  ).length
  const upcomingDeadlineCount = getAllDeadlines(colleges).filter((d) => daysUntil(d.date) >= 0).length

  return {
    overallProgress: overallProgress(colleges),
    collegeCount: colleges.length,
    essaysInProgress,
    recommendationsComplete,
    recommendationsTotal: recommendations.length,
    applicationsCompleted,
    averageAcceptanceRate: averageAcceptanceRate(colleges),
    upcomingDeadlineCount:
      upcomingDeadlineCount + scholarships.filter((s) => daysUntil(s.deadline) >= 0).length,
  }
}

export function buildTimeline(
  activities: Activity[],
  awards: Award[],
  projects: Project[],
  colleges: College[],
  userData: CollegeUserData,
): TimelineEntry[] {
  const entries: TimelineEntry[] = []

  for (const activity of activities) {
    const date = activity.startDate ?? activity.created_at.slice(0, 10)
    entries.push({
      id: `activity-${activity.id}`,
      date,
      title: activity.name,
      subtitle: `${activity.category}${activity.organization ? ` · ${activity.organization}` : ''}`,
      category: 'activity',
      entityId: activity.id,
    })
  }

  for (const award of awards) {
    if (!award.awardDate) continue
    entries.push({
      id: `award-${award.id}`,
      date: award.awardDate,
      title: award.name,
      subtitle: award.organization ?? award.level ?? 'Award',
      category: 'award',
      entityId: award.id,
    })
  }

  for (const project of projects) {
    const date = project.startDate ?? project.created_at.slice(0, 10)
    entries.push({
      id: `project-${project.id}`,
      date,
      title: project.name,
      subtitle: project.myRole ?? 'Project',
      category: 'project',
      entityId: project.id,
    })
  }

  for (const college of colleges) {
    for (const deadline of college.deadlines) {
      entries.push({
        id: `deadline-${college.id}-${deadline.id}`,
        date: deadline.date,
        title: deadline.label,
        subtitle: college.name,
        category: 'deadline',
        entityId: college.id,
      })
    }
  }

  for (const draft of userData.commonApp.personalStatementDrafts) {
    entries.push({
      id: `essay-${draft.id}`,
      date: draft.updatedAt.slice(0, 10),
      title: draft.title,
      subtitle: `Personal statement · ${essayStatusLabel(draft.status)}`,
      category: 'essay',
      entityId: draft.id,
    })
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date))
}

export function scrollToAdvisor() {
  document.getElementById('college-advisor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function parseMajorsInput(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function parseSkillsInput(value: string): string[] {
  return parseMajorsInput(value)
}

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}
