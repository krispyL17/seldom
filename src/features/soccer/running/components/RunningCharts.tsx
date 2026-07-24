import { useDistanceUnit } from '@hooks/useDistanceUnit'
import { Panel } from '@components/ui/Panel'
import type { RunLog } from '../types'
import { bestRunForDistance, formatDuration } from '../utils'

interface RunningChartsProps {
  runs: RunLog[]
}

export function RunningCharts({ runs }: RunningChartsProps) {
  const { unit, formatPace, presets } = useDistanceUnit()
  const primaryPreset = presets.find((p) => p.id === (unit === 'km' ? '5k' : '1mi')) ?? presets[0]
  const primaryPr = primaryPreset ? bestRunForDistance(runs, primaryPreset.meters) : null

  const presetsWithPr = presets
    .map((preset) => ({
      preset,
      best: bestRunForDistance(runs, preset.meters),
    }))
    .filter((x) => x.best)

  if (runs.length === 0) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Panel title={`${primaryPreset?.label ?? 'PR'} PR`} subtitle="Personal best">
        {primaryPr ? (
          <div>
            <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">
              {formatDuration(primaryPr.duration_sec)}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              {formatPace(primaryPr.duration_sec, primaryPr.distance_m)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Log a {primaryPreset?.label.toLowerCase() ?? 'run'} to see your PR
          </p>
        )}
      </Panel>

      {presetsWithPr
        .filter(({ preset }) => preset.id !== primaryPreset?.id)
        .map(({ preset, best }) => (
          <Panel key={preset.id} title={`${preset.label} PR`} subtitle="Personal best">
            <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">
              {formatDuration(best!.duration_sec)}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              {formatPace(best!.duration_sec, preset.meters)}
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
