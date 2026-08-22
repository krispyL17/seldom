import { useMemo } from 'react'
import { useTrainingSessions } from '../training/hooks/useTrainingSessions'
import { useRunLogs } from '../running/hooks/useRunLogs'
import { useSoccerMatches } from '../matches/hooks/useSoccerMatches'
import { useDistanceUnit } from '@hooks/useDistanceUnit'
import { rollingWindowStartIso } from '@lib/rollingWindow'
import { ACUTE_ROLLING_DAYS } from '../athlete/recovery'

/** Compact stat strip — sessions, cardio, intensity, games. */
export function PerformanceStatsBar() {
  const { sessions } = useTrainingSessions()
  const { runs } = useRunLogs()
  const { matches } = useSoccerMatches()
  const { formatDistance } = useDistanceUnit()

  const avgIntensity = useMemo(() => {
    if (sessions.length === 0) return null
    return Math.round((sessions.reduce((s, x) => s + x.intensity, 0) / sessions.length) * 10) / 10
  }, [sessions])

  const runDistanceM = useMemo(() => runs.reduce((s, r) => s + r.distance_m, 0), [runs])

  const minutesLast7 = useMemo(() => {
    const since = rollingWindowStartIso(ACUTE_ROLLING_DAYS)
    const sessionMin = sessions
      .filter((s) => s.session_date >= since)
      .reduce((sum, s) => sum + s.duration_min, 0)
    const runMin = runs
      .filter((r) => r.run_date >= since)
      .reduce((sum, r) => sum + r.duration_sec / 60, 0)
    return sessionMin + runMin
  }, [sessions, runs])

  const tiles = [
    { label: 'Sessions', value: sessions.length || '—' },
    { label: 'Avg RPE', value: avgIntensity ?? '—' },
    { label: '7-day min', value: minutesLast7 ? `${minutesLast7}m` : '—' },
    { label: 'Run total', value: runs.length ? formatDistance(runDistanceM) : '—' },
    { label: 'Games', value: matches.length || '—' },
  ]

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-2">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-[var(--radius-sm)] bg-[var(--color-surface-raised)] px-2 py-1.5">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-tertiary)]">{tile.label}</p>
            <p className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">{tile.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
