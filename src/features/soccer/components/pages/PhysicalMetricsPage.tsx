import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel, DataRow } from '@components/ui/Panel'
import { physicalMetrics } from '../../data/mockData'
import { trendSymbol } from '../../utils'

export function PhysicalMetricsPage() {
  return (
    <div className="space-y-4">
      <Panel title="Physical Profile" subtitle="Season benchmarks" fullWidth>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {physicalMetrics.map((metric) => {
            const pct = Math.min(100, Math.round((metric.value / metric.benchmark) * 100))
            return (
              <div
                key={metric.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-[var(--color-text-primary)]">{metric.name}</p>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">
                    {trendSymbol(metric.trend)}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">
                  {metric.value}
                  <span className="ml-1 text-sm font-normal text-[var(--color-text-secondary)]">
                    {metric.unit}
                  </span>
                </p>
                <DataRow label="Benchmark" value={`${metric.benchmark} ${metric.unit}`} />
                <div className="mt-2">
                  <ProgressBar
                    value={pct}
                    label="vs benchmark"
                    variant={pct >= 95 ? 'success' : pct >= 85 ? 'accent' : 'warning'}
                    size="sm"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
