import { Panel } from '@components/ui/Panel'
import type { RunLog } from '../types'
import { DISTANCE_PRESETS, MILE_M } from '../types'
import { bestRunForDistance, formatDuration, pacePerMile } from '../utils'

interface RunningChartsProps {
  runs: RunLog[]
}

export function RunningCharts({ runs }: RunningChartsProps) {
  const milePr = bestRunForDistance(runs, MILE_M)
  const presetsWithPr = DISTANCE_PRESETS.map((preset) => ({
    preset,
    best: bestRunForDistance(runs, preset.meters),
  })).filter((x) => x.best)

  if (runs.length === 0) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Panel title="Mile PR" subtitle="Personal best">
        {milePr ? (
          <div>
            <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">
              {formatDuration(milePr.duration_sec)}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              {pacePerMile(milePr.duration_sec, MILE_M)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-tertiary)]">Log a mile to see your PR</p>
        )}
      </Panel>

      {presetsWithPr
        .filter(({ preset }) => preset.id !== '1mi')
        .map(({ preset, best }) => (
          <Panel key={preset.id} title={`${preset.label} PR`} subtitle="Personal best">
            <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">
              {formatDuration(best!.duration_sec)}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              {pacePerMile(best!.duration_sec, preset.meters)}
            </p>
          </Panel>
        ))}

      <Panel title="Total runs" subtitle="All distances">
        <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">
          {runs.length}
        </p>
      </Panel>
    </div>
  )
}
