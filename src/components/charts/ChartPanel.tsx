import type { ReactNode } from 'react'
import { Panel } from '@components/ui/Panel'
import { MiniBarChart } from '@components/ui/MiniBarChart'
import type { ChartSeries } from '@analytics/types'

interface ChartPanelProps {
  title: string
  subtitle?: string
  series: ChartSeries
  color?: string
  height?: number
  emptyMessage?: string
  fullWidth?: boolean
  action?: ReactNode
}

export function ChartPanel({
  title,
  subtitle,
  series,
  color = 'var(--color-accent)',
  height = 72,
  emptyMessage = 'No data yet — log activity to see trends.',
  fullWidth,
  action,
}: ChartPanelProps) {
  const hasData = series.data.some((v) => v > 0)

  return (
    <Panel title={title} subtitle={subtitle} fullWidth={fullWidth} action={action}>
      {hasData ? (
        <>
          <MiniBarChart data={series.data} labels={series.labels} height={height} color={color} />
          {series.unit && (
            <p className="mt-2 text-[10px] text-[var(--color-text-tertiary)]">Unit: {series.unit}</p>
          )}
        </>
      ) : (
        <p className="text-xs text-[var(--color-text-tertiary)]">{emptyMessage}</p>
      )}
    </Panel>
  )
}
