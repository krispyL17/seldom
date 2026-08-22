import { formatShortDate } from '@features/soccer/utils'
import type { RunLog } from '../types'
import { filterMileRuns, formatDuration, getMileRunPerformanceTag } from '../utils'
import { MileRunPerformanceBadge } from './MileRunPerformanceBadge'

interface MileRunSnapshotListProps {
  runs: RunLog[]
  /** Most recent mile runs to show (default 3). */
  limit?: number
}

/** Recent mile times with PR / above avg / below avg tags. */
export function MileRunSnapshotList({ runs, limit = 3 }: MileRunSnapshotListProps) {
  const mileRuns = filterMileRuns(runs).slice(0, limit)

  if (mileRuns.length === 0) {
    return (
      <p className="text-xs text-[var(--color-text-tertiary)]">
        Log a 1-mile run to track times here.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {mileRuns.map((run) => {
        const tag = getMileRunPerformanceTag(run, runs)
        return (
          <li
            key={run.id}
            className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[var(--color-surface-raised)] px-2 py-1.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                {formatDuration(run.duration_sec)}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {formatShortDate(run.run_date)}
              </p>
            </div>
            {tag && <MileRunPerformanceBadge tag={tag} />}
          </li>
        )
      })}
    </ul>
  )
}
