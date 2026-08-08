import type { AnalyticsDashboard } from '@analytics/types'

/** Analytics sidebar tab appears once the user has measurable activity. */
export function analyticsHasEnoughData(dashboard: AnalyticsDashboard | null): boolean {
  if (!dashboard) return false

  const hasTraining = dashboard.trainingFrequency.data.some((v) => v > 0)
  const hasTasks = dashboard.taskCompletion.data.some((v) => v > 0)
  const hasJournal = dashboard.journalConsistency.data.some((v) => v > 0)
  const hasRuns = dashboard.running.data.some((v) => v > 0)
  const hasGym = dashboard.gym.data.some((v) => v > 0)

  return hasTraining || hasTasks || hasJournal || hasRuns || hasGym
}

const UNLOCK_SOURCES = [
  { key: 'tasks', label: 'Complete a task', check: (d: AnalyticsDashboard) => d.taskCompletion.data.some((v) => v > 0) },
  { key: 'training', label: 'Log a session', check: (d: AnalyticsDashboard) => d.trainingFrequency.data.some((v) => v > 0) },
  { key: 'journal', label: 'Write in journal', check: (d: AnalyticsDashboard) => d.journalConsistency.data.some((v) => v > 0) },
  { key: 'runs', label: 'Log a run', check: (d: AnalyticsDashboard) => d.running.data.some((v) => v > 0) },
] as const

export function analyticsUnlockProgress(dashboard: AnalyticsDashboard | null) {
  if (!dashboard) {
    return { unlocked: false, completed: 0, total: UNLOCK_SOURCES.length, nextHint: UNLOCK_SOURCES[0].label }
  }
  const completed = UNLOCK_SOURCES.filter((s) => s.check(dashboard)).length
  const next = UNLOCK_SOURCES.find((s) => !s.check(dashboard))
  return {
    unlocked: analyticsHasEnoughData(dashboard),
    completed,
    total: UNLOCK_SOURCES.length,
    nextHint: next?.label ?? 'Unlocked',
  }
}
