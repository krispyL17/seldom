import { Link } from 'react-router-dom'
import { Panel } from '@components/ui/Panel'
import { formatMinutesDuration } from '@lib/formatDuration'
import { MiniBarChart, MetricTile } from '@components/ui/MiniBarChart'
import type { TrainingSession } from '../types'
import {
  averageTechnicalRating,
  formatShortSessionDate,
  sortSessionsForCharts,
} from '../utils'

interface TrainingSessionChartsProps {
  sessions: TrainingSession[]
}

const RECENT_SESSION_LIMIT = 6

/** Compact trend strip on the Sessions tab — full charts live under Progress. */
export function TrainingSessionCharts({ sessions }: TrainingSessionChartsProps) {
  if (sessions.length === 0) {
    return null
  }

  if (sessions.length === 1) {
    return (
      <Panel title="Recent activity" subtitle="One session logged">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Log one more session to see duration and intensity trends here.
        </p>
      </Panel>
    )
  }

  const chronological = sortSessionsForCharts(sessions)
  const recent = chronological.slice(-RECENT_SESSION_LIMIT)
  const labels = recent.map((s) => formatShortSessionDate(s.session_date))
  const durations = recent.map((s) => s.duration_min)
  const intensities = recent.map((s) => s.intensity)

  const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
  const avgIntensity =
    Math.round((intensities.reduce((a, b) => a + b, 0) / intensities.length) * 10) / 10
  const avgSkill =
    Math.round(
      (recent.reduce((sum, s) => sum + averageTechnicalRating(s.technical_ratings), 0) /
        recent.length) *
        10,
    ) / 10

  return (
    <Panel title="Recent trends" subtitle={`Last ${recent.length} sessions`}>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MetricTile label="Avg duration" value={formatMinutesDuration(avgDuration)} />
        <MetricTile label="Avg intensity" value={avgIntensity} unit="/10" />
        <MetricTile label="Avg skills" value={avgSkill} unit="/10" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Duration
          </p>
          <MiniBarChart
            data={durations}
            labels={labels}
            height={52}
            maxBars={RECENT_SESSION_LIMIT}
            formatValue={formatMinutesDuration}
          />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Intensity
          </p>
          <MiniBarChart
            data={intensities}
            labels={labels}
            height={52}
            color="var(--color-warning)"
            maxBars={RECENT_SESSION_LIMIT}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
        <Link to="/soccer/progression" className="text-[var(--color-accent-muted)] hover:underline">
          Open Stats tab
        </Link>{' '}
        for weekly load, skill trends, and longer history.
      </p>
    </Panel>
  )
}
