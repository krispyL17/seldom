/**
 * Shared analytics types — used by SQLite server and React client.
 */

export interface ChartSeries {
  labels: string[]
  data: number[]
  unit?: string
}

export interface SkillTrendSeries {
  skill: string
  labels: string[]
  data: number[]
  latest: number
}

export interface AnalyticsKpi {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface GymLog {
  id: string
  user_id: string
  session_date: string
  duration_min: number
  workout_type: string | null
  notes: string | null
  created_at: string
}

export interface AnalyticsDashboard {
  userId: string
  computedAt: string
  kpis: AnalyticsKpi[]
  taskCompletion: ChartSeries
  goalProgress: ChartSeries
  trainingFrequency: ChartSeries
  technicalSkills: SkillTrendSeries[]
  running: ChartSeries
  gym: ChartSeries
  collegeProgress: ChartSeries
  journalConsistency: ChartSeries
  source: 'sqlite' | 'local'
}

/** Raw records synced from Supabase (and local gym logs). */
export interface AnalyticsSyncPayload {
  userId: string
  tasks: Array<{
    completed: boolean
    updated_at: string
    created_at: string
  }>
  goals: Array<{
    progress: number
    status: string
    updated_at: string
    created_at: string
  }>
  journalEntries: Array<{ entry_date: string }>
  trainingSessions: Array<{
    session_date: string
    duration_min: number
    intensity: number
    technical_ratings: Record<string, number>
  }>
  runLogs: Array<{ run_date: string; distance_m: number; duration_sec: number }>
  gymLogs: GymLog[]
  college: {
    collegeNames: string[]
    collegeProgress: number[]
    overallProgress: number
  } | null
}

export interface AnalyticsServerConfig {
  port: number
  dbPath: string
}

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsServerConfig = {
  port: 3849,
  dbPath: 'data/seldom-analytics.db',
}
