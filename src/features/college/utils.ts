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
  FinancialAidItem,
  FinancialPlanningStats,
  CollegePriorityAction,
  PlanningDeadline,
  Project,
  RecommendationLetter,
  Scholarship,
  ScholarshipStatus,
  TimelineEntry,
} from './types'
import { isResultMilestoneDeadline, globalDeadlineKey } from './data/admissionDeadlines'

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
  const seenGlobal = new Set<string>()
  const result: (CollegeDeadline & { collegeName: string })[] = []

  for (const college of colleges) {
    for (const deadline of college.deadlines) {
      const globalKey = globalDeadlineKey(deadline)
      if (globalKey) {
        if (seenGlobal.has(globalKey)) continue
        seenGlobal.add(globalKey)
        result.push({ ...deadline, collegeName: 'All colleges' })
      } else {
        result.push({ ...deadline, collegeName: college.name })
      }
    }
  }

  return result
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
  const collegeDeadlineCount = getAllDeadlines(colleges).filter((d) => daysUntil(d.date) >= 0).length

  return {
    overallProgress: overallProgress(colleges),
    collegeCount: colleges.length,
    essaysInProgress,
    recommendationsComplete,
    recommendationsTotal: recommendations.length,
    applicationsCompleted,
    averageAcceptanceRate: averageAcceptanceRate(colleges),
    upcomingDeadlineCount:
      collegeDeadlineCount + scholarships.filter((s) => daysUntil(s.deadline) >= 0).length,
  }
}

export function computeFinancialPlanningStats(
  financialAid: FinancialAidItem[],
  scholarships: Scholarship[],
  colleges: College[],
): FinancialPlanningStats {
  const aidTotal = financialAid.length
  const aidCompleted = financialAid.filter((i) => i.completed).length
  const aidChecklistProgress = aidTotal > 0 ? Math.round((aidCompleted / aidTotal) * 100) : 0
  const overdueAidCount = financialAid.filter(
    (i) => !i.completed && i.dueDate && isOverdue(i.dueDate),
  ).length

  const upcomingAid = financialAid
    .filter((i) => !i.completed && i.dueDate && daysUntil(i.dueDate) >= 0)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
  const nextAid = upcomingAid[0]

  const activeScholarships = scholarships.filter(
    (s) => s.status !== 'awarded' && s.status !== 'rejected',
  )
  const scholarshipAwardedTotal = scholarships
    .filter((s) => s.status === 'awarded')
    .reduce((sum, s) => sum + s.amount, 0)
  const scholarshipPendingTotal = activeScholarships.reduce((sum, s) => sum + s.amount, 0)
  const nextScholarship = [...activeScholarships]
    .filter((s) => daysUntil(s.deadline) >= 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))[0]

  const listTuitionTotal = colleges.reduce((sum, c) => sum + (c.tuition ?? 0), 0)
  const netGapEstimate = Math.max(0, listTuitionTotal - scholarshipAwardedTotal)

  return {
    aidChecklistProgress,
    aidCompleted,
    aidTotal,
    overdueAidCount,
    nextAidLabel: nextAid?.label ?? null,
    nextAidDueDate: nextAid?.dueDate ?? null,
    scholarshipAwardedTotal,
    scholarshipPendingTotal,
    scholarshipActiveCount: activeScholarships.length,
    nextScholarshipName: nextScholarship?.name ?? null,
    nextScholarshipDueDate: nextScholarship?.deadline ?? null,
    listTuitionTotal,
    netGapEstimate,
  }
}

export function getUnifiedPlanningDeadlines(
  colleges: College[],
  financialAid: FinancialAidItem[],
  scholarships: Scholarship[],
  limit = 6,
): PlanningDeadline[] {
  const entries: PlanningDeadline[] = []

  for (const d of getAllDeadlines(colleges)) {
    entries.push({
      id: `college-${d.id}`,
      label: d.label,
      date: d.date,
      subtitle: d.collegeName,
    })
  }

  for (const item of financialAid) {
    if (item.completed || !item.dueDate) continue
    entries.push({
      id: `aid-${item.id}`,
      label: item.label,
      date: item.dueDate,
      subtitle: 'Financial planning',
    })
  }

  for (const s of scholarships) {
    if (s.status === 'awarded' || s.status === 'rejected') continue
    entries.push({
      id: `sch-${s.id}`,
      label: s.name,
      date: s.deadline,
      subtitle: `Scholarship · ${scholarshipStatusLabel(s.status)}`,
    })
  }

  return entries
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
}

export function getCollegePriorityActions(
  colleges: College[],
  activities: Activity[],
  awards: Award[],
  projects: Project[],
  userData: CollegeUserData | null,
  isSeniorMode: boolean,
  limit = 5,
): CollegePriorityAction[] {
  const actions: CollegePriorityAction[] = []
  const financialAid = userData?.financialAid ?? []
  const scholarships = userData?.scholarships ?? []
  const testScores = userData?.testScores
  const deadlines = getUnifiedPlanningDeadlines(colleges, financialAid, scholarships, 12)

  for (const d of deadlines) {
    const days = daysUntil(d.date)
    if (days < 0) {
      actions.push({
        id: `overdue-${d.id}`,
        label: d.label,
        detail: `Overdue · ${d.subtitle}`,
        to: '/college/deadlines',
        urgency: 'high',
      })
    } else if (days <= 7) {
      actions.push({
        id: `soon-${d.id}`,
        label: d.label,
        detail: `Due in ${days} day${days === 1 ? '' : 's'} · ${d.subtitle}`,
        to: '/college/deadlines',
        urgency: 'high',
      })
    }
  }

  if (colleges.length === 0) {
    actions.push({
      id: 'no-colleges',
      label: 'Add schools to your list',
      detail: isSeniorMode
        ? 'Track deadlines and checklists per application'
        : 'Start researching fit, cost, and visit dates',
      to: '/college/schools',
      urgency: 'high',
    })
  } else {
    const weakest = [...colleges].sort((a, b) => collegeProgress(a) - collegeProgress(b))[0]
    if (weakest && collegeProgress(weakest) < 100) {
      const pending = weakest.checklist.filter((i) => !i.completed).length
      actions.push({
        id: `checklist-${weakest.id}`,
        label: `${weakest.name} checklist`,
        detail: `${pending} step${pending === 1 ? '' : 's'} left · ${collegeProgress(weakest)}% done`,
        to: `/college/schools/${weakest.id}`,
        urgency: collegeProgress(weakest) < 40 ? 'high' : 'medium',
      })
    }
  }

  const nextAid = financialAid
    .filter((i) => !i.completed)
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return 0
    })[0]

  if (nextAid) {
    actions.push({
      id: `aid-${nextAid.id}`,
      label: nextAid.label,
      detail: nextAid.dueDate
        ? `Financial planning · due ${formatShortDate(nextAid.dueDate)}`
        : 'Financial planning checklist',
      to: '/college/planning',
      urgency:
        nextAid.dueDate && isOverdue(nextAid.dueDate)
          ? 'high'
          : nextAid.dueDate && daysUntil(nextAid.dueDate) <= 14
            ? 'medium'
            : 'low',
    })
  } else if (financialAid.length === 0) {
    actions.push({
      id: 'load-aid',
      label: isSeniorMode ? 'Load financial aid checklist' : 'Start financial planning',
      detail: 'FAFSA, scholarships, and cost tracking',
      to: '/college/planning',
      urgency: isSeniorMode ? 'medium' : 'low',
    })
  }

  const experienceCount = activities.length + awards.length + projects.length
  if (experienceCount === 0) {
    actions.push({
      id: 'add-experience',
      label: 'Add activities & experience',
      detail: 'Build your Common App activity list',
      to: '/college/common-app?tab=experience',
      urgency: 'medium',
    })
  } else if (!isSeniorMode && activities.length < 3) {
    actions.push({
      id: 'more-activities',
      label: 'Expand your activity list',
      detail: `${activities.length} activit${activities.length === 1 ? 'y' : 'ies'} logged — aim for depth across junior year`,
      to: '/college/common-app?tab=experience',
      urgency: 'low',
    })
  }

  if (isSeniorMode) {
    const essaysPending = colleges
      .flatMap((c) => c.essays)
      .filter((e) => e.status !== 'final' && e.status !== 'not_started').length
    const draftsPending = (userData?.commonApp.personalStatementDrafts ?? []).filter(
      (d) => d.status !== 'final',
    ).length
    if (essaysPending + draftsPending > 0) {
      actions.push({
        id: 'essays-in-progress',
        label: 'Finish in-progress essays',
        detail: `${essaysPending + draftsPending} draft${essaysPending + draftsPending === 1 ? '' : 's'} not marked final`,
        to: '/college/common-app?tab=essays',
        urgency: 'medium',
      })
    }

    const satDone = testScores?.sat.status === 'completed' || testScores?.sat.status === 'sent'
    const actDone = testScores?.act.status === 'completed' || testScores?.act.status === 'sent'
    if (!satDone && !actDone) {
      actions.push({
        id: 'test-scores',
        label: 'Log test scores',
        detail: 'SAT/ACT status for applications and aid',
        to: '/college/planning',
        urgency: 'low',
      })
    }
  }

  const urgencyRank: Record<CollegePriorityAction['urgency'], number> = {
    high: 0,
    medium: 1,
    low: 2,
  }

  const seen = new Set<string>()
  return actions
    .sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency])
    .filter((a) => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })
    .slice(0, limit)
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

  const seenGlobal = new Set<string>()

  for (const college of colleges) {
    for (const deadline of college.deadlines) {
      const globalKey = globalDeadlineKey(deadline)
      if (globalKey) {
        if (seenGlobal.has(globalKey)) continue
        seenGlobal.add(globalKey)
        entries.push({
          id: `deadline-global-${globalKey}`,
          date: deadline.date,
          title: deadline.label,
          subtitle: 'All colleges',
          category: isResultMilestoneDeadline(deadline) ? 'milestone' : 'deadline',
          entityId: college.id,
        })
      } else {
        entries.push({
          id: `deadline-${college.id}-${deadline.id}`,
          date: deadline.date,
          title: deadline.label,
          subtitle: college.name,
          category: isResultMilestoneDeadline(deadline) ? 'milestone' : 'deadline',
          entityId: college.id,
        })
      }
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

  for (const item of userData.financialAid) {
    if (item.completed || !item.dueDate) continue
    entries.push({
      id: `aid-${item.id}`,
      date: item.dueDate,
      title: item.label,
      subtitle: 'Financial planning',
      category: 'deadline',
      entityId: item.id,
    })
  }

  for (const s of userData.scholarships) {
    if (s.status === 'awarded' || s.status === 'rejected') continue
    entries.push({
      id: `sch-${s.id}`,
      date: s.deadline,
      title: s.name,
      subtitle: `Scholarship · ${scholarshipStatusLabel(s.status)}`,
      category: 'deadline',
      entityId: s.id,
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
