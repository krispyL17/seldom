import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@hooks/useAuth'
import { buildAnalyticsDashboard } from '@analytics/aggregations'
import type { AnalyticsDashboard, AnalyticsSyncPayload } from '@analytics/types'
import { computeDashboardStats, overallProgress, collegeProgress } from '@features/college/utils'
import { collegeService } from '@services/database/colleges'
import { goalService } from '@services/database/goals'
import { journalService } from '@services/database/journal'
import { runLogService } from '@services/database/runLogs'
import { taskService } from '@services/database/tasks'
import { trainingSessionService } from '@services/database/trainingSessions'
import {
  fetchGymLogs,
  isAnalyticsServerAvailable,
  syncAnalytics,
} from '@services/analytics/analyticsClient'

interface AnalyticsContextValue {
  dashboard: AnalyticsDashboard | null
  loading: boolean
  refreshing: boolean
  error: string | null
  sqliteConnected: boolean
  reload: () => Promise<void>
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sqliteConnected, setSqliteConnected] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (!user) {
      setDashboard(null)
      setLoading(false)
      return
    }

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const results = await Promise.allSettled([
        taskService.fetchAll(),
        goalService.fetchAll(),
        journalService.fetchAll(),
        trainingSessionService.fetchAll(),
        runLogService.fetchAll(),
        collegeService.fetchAll(),
      ])

      const tasks = results[0].status === 'fulfilled' ? results[0].value : []
      const goals = results[1].status === 'fulfilled' ? results[1].value : []
      const journalEntries = results[2].status === 'fulfilled' ? results[2].value : []
      const trainingSessions = results[3].status === 'fulfilled' ? results[3].value : []
      const runLogs = results[4].status === 'fulfilled' ? results[4].value : []
      const colleges = results[5].status === 'fulfilled' ? results[5].value : []

      const partialErrors = results
        .map((r, i) =>
          r.status === 'rejected'
            ? ['tasks', 'goals', 'journal', 'training', 'runs', 'colleges'][i]
            : null,
        )
        .filter(Boolean)

      if (partialErrors.length > 0) {
        console.warn('[analytics] partial load failure:', partialErrors.join(', '))
      }

      const collegeStats =
        colleges.length > 0 ? computeDashboardStats(colleges, [], []) : null

      const sqliteUp = await isAnalyticsServerAvailable()
      setSqliteConnected(sqliteUp)

      let gymLogs: Awaited<ReturnType<typeof fetchGymLogs>> = []
      if (sqliteUp) {
        try {
          gymLogs = await fetchGymLogs(user.id)
        } catch (gymErr) {
          console.warn('[analytics] gym logs unavailable:', gymErr)
        }
      }

      const payload: AnalyticsSyncPayload = {
        userId: user.id,
        tasks: tasks.map((t) => ({
          completed: t.completed,
          updated_at: t.updated_at,
          created_at: t.created_at,
        })),
        goals: goals.map((g) => ({
          progress: g.progress,
          status: g.status,
          updated_at: g.updated_at,
          created_at: g.created_at,
        })),
        journalEntries: journalEntries.map((e) => ({ entry_date: e.entry_date })),
        trainingSessions: trainingSessions.map((s) => ({
          session_date: s.session_date,
          duration_min: s.duration_min,
          intensity: s.intensity,
          technical_ratings: s.technical_ratings as unknown as Record<string, number>,
        })),
        runLogs: runLogs.map((r) => ({
          run_date: r.run_date,
          distance_m: r.distance_m,
          duration_sec: r.duration_sec,
        })),
        gymLogs,
        college:
          colleges.length > 0
            ? {
                collegeNames: colleges.map((c) => c.name),
                collegeProgress: colleges.map((c) => collegeProgress(c)),
                overallProgress: collegeStats?.overallProgress ?? overallProgress(colleges),
              }
            : null,
      }

      if (sqliteUp) {
        const synced = await syncAnalytics(payload)
        setDashboard(synced)
      } else {
        setDashboard(buildAnalyticsDashboard(payload, 'local'))
      }

      setError(partialErrors.length === results.length ? 'Failed to load analytics data' : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    void load(false)
  }, [load])

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      dashboard,
      loading,
      refreshing,
      error,
      sqliteConnected,
      reload: () => load(true),
    }),
    [dashboard, loading, refreshing, error, sqliteConnected, load],
  )

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext)
  if (!ctx) {
    throw new Error('useAnalytics must be used within AnalyticsProvider')
  }
  return ctx
}
