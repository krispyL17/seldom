import type { Task, TaskFilters, TaskPriority, TaskSortDirection, TaskSortField } from './types'
import { TASK_PRIORITY_ORDER } from './types'

/** Convert ISO date to `datetime-local` input value */
export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

/** Convert `datetime-local` input value to ISO string */
export function fromDatetimeLocalValue(value: string): string | null {
  if (!value) return null
  return new Date(value).toISOString()
}

/** Format minutes as human-readable duration */
export function formatDuration(minutes: number | null): string {
  if (minutes == null || minutes <= 0) return '—'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** Format deadline for display */
export function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline'
  return new Date(deadline).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isOverdue(task: Task): boolean {
  if (!task.deadline || task.completed) return false
  return new Date(task.deadline) < new Date()
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const query = filters.search.trim().toLowerCase()

  return tasks.filter((task) => {
    if (filters.status === 'active' && task.completed) return false
    if (filters.status === 'completed' && !task.completed) return false
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false
    if (filters.category !== 'all' && (task.category ?? '') !== filters.category) return false

    if (query) {
      const haystack = [
        task.title,
        task.description ?? '',
        task.category ?? '',
        task.notes ?? '',
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    return true
  })
}

export function sortTasks(
  tasks: Task[],
  field: TaskSortField,
  direction: TaskSortDirection,
): Task[] {
  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0

    switch (field) {
      case 'title':
        cmp = a.title.localeCompare(b.title)
        break
      case 'priority':
        cmp = TASK_PRIORITY_ORDER[a.priority] - TASK_PRIORITY_ORDER[b.priority]
        break
      case 'deadline': {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity
        const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity
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

export function getUniqueCategories(tasks: Task[]): string[] {
  const set = new Set<string>()
  for (const task of tasks) {
    if (task.category) set.add(task.category)
  }
  return Array.from(set).sort()
}

export function priorityLabel(priority: TaskPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

export function priorityBadgeVariant(
  priority: TaskPriority,
): 'success' | 'warning' | 'danger' | 'muted' {
  switch (priority) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'warning'
    case 'low':
      return 'success'
    default:
      return 'muted'
  }
}
