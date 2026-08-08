import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { EmptyState } from '@components/ui/EmptyState'
import { Panel, PanelDivider } from '@components/ui/Panel'
import { MiniBarChart, MetricTile } from '@components/ui/MiniBarChart'
import { ProgressBar } from '@components/ui/ProgressBar'
import { formatMinutesDuration } from '@lib/formatDuration'
import {
  TECHNICAL_RATING_KEYS,
  TECHNICAL_RATING_LABELS,
  type TechnicalRatingKey,
} from '../../training/types'
import { useTrainingSessions } from '../../training/hooks/useTrainingSessions'
import {
  formatShortSessionDate,
  getSkillTrend,
  sortSessionsForCharts,
} from '../../training/utils'

const PROGRESS_SKILL_KEYS: TechnicalRatingKey[] = [
  'passing',
  'shooting',
  'dribbling',
  'confidence',
]

function groupSessionsByWeek(sessions: { session_date: string; duration_min: number; intensity: number }[]) {
  const buckets = new Map<string, { minutes: number; sessions: number; rpeSum: number }>()

  for (const session of sessions) {
    const date = new Date(`${session.session_date}T12:00:00`)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    const existing = buckets.get(key) ?? { minutes: 0, sessions: 0, rpeSum: 0 }
    existing.minutes += session.duration_min
    existing.sessions += 1
    existing.rpeSum += session.intensity
    buckets.set(key, existing)
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, data]) => ({
      week: new Date(`${week}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes: data.minutes,
      sessions: data.sessions,
      avgRpe: Math.round((data.rpeSum / data.sessions) * 10) / 10,
    }))
}

export function ProgressChartsPage() {
  const { sessions, loading } = useTrainingSessions()

  const weeklyLoad = useMemo(() => groupSessionsByWeek(sessions), [sessions])
  const recentSessions = useMemo(() => sortSessionsForCharts(sessions).slice(-8), [sessions])
  const recentLabels = recentSessions.map((s) => formatShortSessionDate(s.session_date))

  const totals = useMemo(() => {
    if (sessions.length === 0) return null
    const minutes = sessions.reduce((sum, s) => sum + s.duration_min, 0)
    const intensity =
      Math.round(
        (sessions.reduce((sum, s) => sum + s.intensity, 0) / sessions.length) * 10,
      ) / 10
    return { minutes, intensity, count: sessions.length }
  }, [sessions])

  if (loading) {
    return (
      <Panel title="Progress" subtitle="Loading…">
        <p className="py-6 text-center text-sm text-[var(--color-text-tertiary)]">Loading…</p>
      </Panel>
    )
  }

  if (sessions.length === 0) {
    return (
      <Panel title="Progress" subtitle="Trends from your training log">
        <EmptyState
          title="No data to chart yet"
          description="Log training sessions to see weekly load, intensity, and skill trends."
          className="py-10"
          action={
            <Link
              to="/soccer/training"
              className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
            >
              Log first session
            </Link>
          }
        />
      </Panel>
    )
  }

  return (
    <div className="space-y-4">
      {totals && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <MetricTile label="Sessions" value={totals.count} />
          <MetricTile label="Total time" value={formatMinutesDuration(totals.minutes)} />
          <MetricTile label="Avg intensity" value={totals.intensity} unit="/10" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Weekly load" subtitle="Training time per week (last 8 weeks)">
          <MiniBarChart
            data={weeklyLoad.map((w) => w.minutes)}
            labels={weeklyLoad.map((w) => w.week)}
            height={64}
            maxBars={8}
            formatValue={formatMinutesDuration}
          />
        </Panel>

        <Panel title="Sessions per week" subtitle="Consistency">
          <MiniBarChart
            data={weeklyLoad.map((w) => w.sessions)}
            labels={weeklyLoad.map((w) => w.week)}
            height={64}
            maxBars={8}
          />
        </Panel>

        <Panel title="Recent duration" subtitle="Last 8 sessions">
          <MiniBarChart
            data={recentSessions.map((s) => s.duration_min)}
            labels={recentLabels}
            height={64}
            maxBars={8}
            formatValue={formatMinutesDuration}
          />
        </Panel>

        <Panel title="Recent intensity" subtitle="Last 8 sessions">
          <MiniBarChart
            data={recentSessions.map((s) => s.intensity)}
            labels={recentLabels}
            height={64}
            color="var(--color-warning)"
            maxBars={8}
          />
        </Panel>
      </div>

      {recentSessions.length >= 2 && (
        <Panel title="Skill snapshot" subtitle="Key ratings from recent sessions">
          <div className="grid gap-3 sm:grid-cols-2">
            {PROGRESS_SKILL_KEYS.map((key) => {
              const trend = getSkillTrend(sessions, key).slice(-8)
              const labels = sortSessionsForCharts(sessions)
                .slice(-8)
                .map((s) => formatShortSessionDate(s.session_date))
              const latest = trend[trend.length - 1] ?? 0
              const previous = trend.length > 1 ? trend[trend.length - 2] : latest
              const delta = latest - previous

              return (
                <div
                  key={key}
                  className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {TECHNICAL_RATING_LABELS[key]}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-[var(--color-text-primary)]">
                      {latest}/10
                      {delta !== 0 && (
                        <span
                          className={
                            delta > 0
                              ? 'ml-1 text-[var(--color-success)]'
                              : 'ml-1 text-[var(--color-danger)]'
                          }
                        >
                          {delta > 0 ? '+' : ''}
                          {delta}
                        </span>
                      )}
                    </span>
                  </div>
                  <MiniBarChart data={trend} labels={labels} height={36} maxBars={8} />
                  <ProgressBar value={latest * 10} showValue={false} variant="accent" size="sm" className="mt-2" />
                </div>
              )
            })}
          </div>
          <PanelDivider />
          <p className="text-[10px] text-[var(--color-text-tertiary)]">
            All {TECHNICAL_RATING_KEYS.length} skills are rated when you log a session — only the most
            useful four are charted here.
          </p>
        </Panel>
      )}

      {weeklyLoad.length > 0 && (
        <Panel title="Weekly intensity" subtitle="Average RPE by week">
          <div className="space-y-2.5">
            {weeklyLoad.map((w) => (
              <div key={w.week}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">{w.week}</span>
                  <span className="tabular-nums text-[var(--color-text-tertiary)]">
                    {w.avgRpe}/10 · {w.sessions} session{w.sessions === 1 ? '' : 's'}
                  </span>
                </div>
                <ProgressBar
                  value={(w.avgRpe / 10) * 100}
                  showValue={false}
                  variant={w.avgRpe >= 7 ? 'warning' : 'accent'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}
