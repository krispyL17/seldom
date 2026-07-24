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
