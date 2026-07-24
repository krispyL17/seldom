import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { EmptyState } from '@components/ui/EmptyState'
import { Panel, PanelDivider } from '@components/ui/Panel'
import { MiniBarChart, MetricTile } from '@components/ui/MiniBarChart'
import { ProgressBar } from '@components/ui/ProgressBar'
import { useTrainingSessions } from '../../training/hooks/useTrainingSessions'

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

  if (loading) {
    return (
      <Panel title="Progress" subtitle="Loading…" fullWidth>
        <p className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">Loading…</p>
      </Panel>
    )
  }

  if (sessions.length === 0) {
    return (
      <Panel title="Progress Charts" subtitle="Trends from your training log" fullWidth>
        <EmptyState
          title="No data to chart yet"
          description="Log training sessions to see weekly load, intensity trends, and session counts here."
          className="py-12"
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
    <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Weekly Training Load" subtitle="Minutes per week" fullWidth className="lg:col-span-2">
        <MiniBarChart
          data={weeklyLoad.map((w) => w.minutes)}
          labels={weeklyLoad.map((w) => w.week)}
          height={120}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {weeklyLoad.slice(-4).map((w) => (
            <MetricTile
              key={w.week}
              label={w.week}
              value={w.minutes}
              unit="min"
              trend={w.avgRpe >= 7 ? 'up' : 'neutral'}
            />
          ))}
        </div>
      </Panel>

      <Panel title="Session Count" subtitle="Sessions per week">
        <MiniBarChart
          data={weeklyLoad.map((w) => w.sessions * 10)}
          labels={weeklyLoad.map((w) => w.week)}
          height={80}
        />
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          {sessions.length} total sessions logged
        </p>
      </Panel>

      <Panel title="Average Intensity" subtitle="From session logs">
        <MiniBarChart
          data={weeklyLoad.map((w) => w.avgRpe * 10)}
          labels={weeklyLoad.map((w) => w.week)}
          height={80}
        />
      </Panel>

      <Panel title="RPE Trend" subtitle="Session intensity" fullWidth className="lg:col-span-2">
        <div className="space-y-3">
          {weeklyLoad.map((w) => (
            <div key={w.week}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">{w.week}</span>
                <span className="tabular-nums text-[var(--color-text-tertiary)]">
                  Avg {w.avgRpe}/10 · {w.sessions} sessions
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
        <PanelDivider />
        <p className="text-[10px] text-[var(--color-text-tertiary)]">
          Charts reflect only what you log — no demo or preset data.
        </p>
      </Panel>
    </div>
  )
}
