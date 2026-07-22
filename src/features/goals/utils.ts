import type { Goal, GoalFilters, GoalSortDirection, GoalSortField, Milestone } from './types'

export function createMilestoneId(): string {
  return crypto.randomUUID()
}

export function formatTargetDate(date: string | null): string {
  if (!date) return 'No target date'
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function isTargetOverdue(goal: Goal): boolean {
  if (!goal.target_date || goal.status !== 'active') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${goal.target_date}T00:00:00`) < today
}

export function progressFromMilestones(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0
  const done = milestones.filter((m) => m.completed).length
  return Math.round((done / milestones.length) * 100)
}

export function filterGoals(goals: Goal[], filters: GoalFilters): Goal[] {
  const query = filters.search.trim().toLowerCase()

  return goals.filter((goal) => {
    if (filters.status !== 'all' && goal.status !== filters.status) return false
    if (filters.category !== 'all' && (goal.category ?? '') !== filters.category) return false

    if (query) {
      const haystack = [
        goal.title,
        goal.description ?? '',
        goal.category ?? '',
        ...goal.milestones.map((m) => m.title),
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    return true
  })
}

export function sortGoals(
  goals: Goal[],
  field: GoalSortField,
  direction: GoalSortDirection,
): Goal[] {
  const sorted = [...goals].sort((a, b) => {
    let cmp = 0

    switch (field) {
      case 'title':
        cmp = a.title.localeCompare(b.title)
        break
      case 'progress':
        cmp = a.progress - b.progress
        break
      case 'target_date': {
        const aTime = a.target_date ? new Date(a.target_date).getTime() : Infinity
        const bTime = b.target_date ? new Date(b.target_date).getTime() : Infinity
        cmp = aTime - bTime
        break
      }
      case 'created_at':
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
    }

    return direction === 'asc' ? cmp : -cmp
  })

  return sorted
}

export function getUniqueCategories(goals: Goal[]): string[] {
  const set = new Set<string>()
  for (const goal of goals) {
    if (goal.category) set.add(goal.category)
  }
  return Array.from(set).sort()
}

export function statusLabel(status: Goal['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function statusBadgeVariant(
  status: Goal['status'],
): 'success' | 'warning' | 'muted' | 'accent' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'archived':
      return 'muted'
    case 'active':
      return 'accent'
    default:
      return 'muted'
  }
}

export function progressVariant(progress: number): 'accent' | 'success' | 'warning' {
  if (progress >= 100) return 'success'
  if (progress >= 50) return 'accent'
  return 'warning'
}
