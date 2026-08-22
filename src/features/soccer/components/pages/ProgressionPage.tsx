import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Panel } from '@components/ui/Panel'
import { MiniBarChart } from '@components/ui/MiniBarChart'
import { PerformanceStatsBar } from '../PerformanceStatsBar'
import { useTrainingSessions } from '../../training/hooks/useTrainingSessions'
import { useRunLogs } from '../../running/hooks/useRunLogs'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import { useDistanceUnit } from '@hooks/useDistanceUnit'
import { InjuryModeLock } from '../../athlete/components/InjuryModeBanner'
import { StreakFlame, StreakMilestoneBadges } from '../../athlete/components/StreakFlame'
import {
  aggregateSideBalanceHistory,
  averageWeakSidePct,
  dominantSideLabel,
} from '../../athlete/sideTracking'
import { formatShortSessionDate, sortSessionsForCharts } from '../../training/utils'

function weeklyRunVolume(runs: { run_date: string; distance_m: number }[]) {
  const buckets = new Map<string, number>()
  for (const run of runs) {
    const date = new Date(`${run.run_date}T12:00:00`)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    buckets.set(key, (buckets.get(key) ?? 0) + run.distance_m)
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([week, meters]) => ({
      label: new Date(`${week}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      km: Math.round((meters / 1000) * 10) / 10,
    }))
}

export function ProgressionPage() {
  const { sessions, loading } = useTrainingSessions()
  const { runs } = useRunLogs()
  const { unit, formatDistance } = useDistanceUnit()
  const { development } = useAthleteDevelopment()
  const { streak, sideProfile } = development

  const recent = useMemo(() => sortSessionsForCharts(sessions).slice(-8), [sessions])
  const weeklyRuns = useMemo(() => weeklyRunVolume(runs), [runs])

  const sideHistory = useMemo(() => aggregateSideBalanceHistory(sessions), [sessions])
  const avgWeak = averageWeakSidePct(sideHistory)

  if (loading) {
    return <p className="py-3 text-center text-xs text-[var(--color-text-tertiary)]">Loading…</p>
  }

  return (
    <InjuryModeLock>
      <div className="perf-page-fit flex flex-col gap-2">
        <PerformanceStatsBar />

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          <Panel title="Streak">
            <StreakFlame current={streak.current} longest={streak.longest} frozen={streak.frozen} compact />
            <div className="mt-1.5">
              <StreakMilestoneBadges achieved={streak.milestonesAchieved} />
            </div>
          </Panel>

          <Panel title={`Weekly ${unit}`} subtitle="Cardio volume">
            {weeklyRuns.length === 0 ? (
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Log runs in{' '}
                <Link to="/soccer/running" className="text-[var(--color-accent-muted)] hover:underline">
                  Cardio
                </Link>
                .
              </p>
            ) : (
              <>
                <MiniBarChart
                  data={weeklyRuns.map((w) =>
                    unit === 'km' ? w.km : Math.round(w.km * 0.621371 * 10) / 10,
                  )}
                  labels={weeklyRuns.map((w) => w.label)}
                  height={48}
                  maxBars={6}
                  showAxis
                  showValues
                />
                <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                  Total: {formatDistance(runs.reduce((s, r) => s + r.distance_m, 0))}
                </p>
              </>
            )}
          </Panel>

          {recent.length >= 2 && (
            <Panel title="Intensity" subtitle="Recent sessions">
              <MiniBarChart
                data={recent.map((s) => s.intensity)}
                labels={recent.map((s) => formatShortSessionDate(s.session_date))}
                height={48}
                maxBars={8}
                color="var(--color-warning)"
                showAxis
                showValues
              />
            </Panel>
          )}

          <Panel title="Weak side" subtitle="Session balance">
            {sideHistory.length === 0 ? (
              <p className="text-xs text-[var(--color-text-tertiary)]">Enable side balance when logging.</p>
            ) : (
              <>
                <p className="text-xs text-[var(--color-text-primary)]">
                  Avg weak-side: <strong>{avgWeak}%</strong>
                  {sideProfile.weakSide !== 'unknown' && (
                    <span className="text-[var(--color-text-tertiary)]">
                      {' '}
                      · {dominantSideLabel(sideProfile.weakSide)}
                    </span>
                  )}
                </p>
                <MiniBarChart
                  data={sideHistory.slice(-6).map((p) => p.weak_pct)}
                  labels={sideHistory.slice(-6).map((p) => formatShortSessionDate(p.date))}
                  height={48}
                  maxBars={6}
                  color="var(--color-accent-muted)"
                  showAxis
                  showValues
                />
              </>
            )}
          </Panel>
        </div>
      </div>
    </InjuryModeLock>
  )
}
