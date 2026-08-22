import { MetricTile } from '@components/ui/MiniBarChart'
import type { AnalyticsKpi } from '@analytics/types'

interface AnalyticsKpiRowProps {
  kpis: AnalyticsKpi[]
}

export function AnalyticsKpiRow({ kpis }: AnalyticsKpiRowProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((kpi) => (
        <MetricTile
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          unit={kpi.unit}
          trend={kpi.trend}
          deltaLabel={kpi.deltaLabel}
          sparkline={kpi.sparkline}
        />
      ))}
    </div>
  )
}
