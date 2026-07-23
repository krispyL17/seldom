import { Panel } from '@components/ui/Panel'
import { EmptyState } from '@components/ui/EmptyState'
import { MiniBarChart } from '@components/ui/MiniBarChart'
import { useCollege } from '../../hooks/useCollege'
import { statusLabel } from '../../utils'

export function CollegeAnalyticsPanel() {
  const { colleges, stats } = useCollege()

  const statusCounts = colleges.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(statusCounts).map(([, count]) => count)
  const chartLabels = Object.entries(statusCounts).map(([status]) =>
    statusLabel(status as Parameters<typeof statusLabel>[0]),
  )

  return (
    <Panel title="Application Analytics" subtitle="List composition" fullWidth>
      {colleges.length === 0 ? (
        <EmptyState
          title="No schools on your list"
          description="Add colleges to see status breakdown and progress metrics."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] p-3">
            <p className="text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
              {stats.collegeCount}
            </p>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">Total schools</p>
          </div>
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] p-3">
            <p className="text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
              {stats.averageAcceptanceRate}%
            </p>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">Avg acceptance</p>
          </div>
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] p-3">
            <p className="text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
              {stats.recommendationsComplete}/{stats.recommendationsTotal}
            </p>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">Rec letters</p>
          </div>
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] p-3">
            <p className="text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
              {stats.overallProgress}%
            </p>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">Checklist progress</p>
          </div>
        </div>
        {chartData.length > 0 && <MiniBarChart data={chartData} labels={chartLabels} />}
        </div>
      )}
    </Panel>
  )
}
