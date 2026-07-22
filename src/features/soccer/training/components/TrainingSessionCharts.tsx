import { Panel, PanelDivider } from '@components/ui/Panel'
import { MiniBarChart } from '@components/ui/MiniBarChart'
import { ProgressBar } from '@components/ui/ProgressBar'
import type { TrainingSession } from '../types'
import { TECHNICAL_RATING_KEYS, TECHNICAL_RATING_LABELS } from '../types'
import {
  averageTechnicalRating,
  formatShortSessionDate,
  getSkillTrend,
  sortSessionsForCharts,
} from '../utils'

interface TrainingSessionChartsProps {
  sessions: TrainingSession[]
}

export function TrainingSessionCharts({ sessions }: TrainingSessionChartsProps) {
  if (sessions.length < 2) {
    return (
      <Panel title="Progress Over Time" subtitle="Trends & charts">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Log at least 2 sessions to see charts and trends.
        </p>
      </Panel>
    )
  }

  const chronological = sortSessionsForCharts(sessions)
  const labels = chronological.map((s) => formatShortSessionDate(s.session_date))
  const durations = chronological.map((s) => s.duration_min)
  const intensities = chronological.map((s) => s.intensity * 10)
  const energies = chronological.map((s) => s.energy_level * 20)
  const techAvgs = chronological.map((s) => averageTechnicalRating(s.technical_ratings) * 10)

  return (
    <Panel title="Progress Over Time" subtitle={`${sessions.length} sessions`} fullWidth>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Duration (minutes)
          </p>
          <MiniBarChart data={durations} labels={labels} height={72} />
        </div>
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Intensity
          </p>
          <MiniBarChart data={intensities} labels={labels} height={72} color="var(--color-warning)" />
        </div>
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Energy
          </p>
          <MiniBarChart data={energies} labels={labels} height={72} />
        </div>
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Avg technical rating
          </p>
          <MiniBarChart data={techAvgs} labels={labels} height={72} color="var(--color-success)" />
        </div>
      </div>

      <PanelDivider label="Skill trends (1–10)" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TECHNICAL_RATING_KEYS.map((key) => {
          const trend = getSkillTrend(sessions, key)
          const latest = trend[trend.length - 1] ?? 0
          return (
            <div
              key={key}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                  {TECHNICAL_RATING_LABELS[key]}
                </span>
                <span className="text-xs font-semibold tabular-nums text-[var(--color-text-primary)]">
                  {latest}
                </span>
              </div>
              <MiniBarChart data={trend} labels={labels} height={40} />
              <ProgressBar value={latest * 10} showValue={false} variant="accent" size="sm" className="mt-2" />
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
