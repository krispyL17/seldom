import type { ReactNode } from 'react'
import { Panel } from '@components/ui/Panel'
import { ActivityHeatmap } from '@components/ui/ActivityHeatmap'
import { MiniBarChart } from '@components/ui/MiniBarChart'
import type { ChartSeries } from '@analytics/types'

interface ChartPanelProps {
  title: string
  subtitle?: string
  series: ChartSeries
  color?: string
  height?: number
  emptyMessage?: string
  /** Shown when series has slots but every value is zero. */
  zeroMessage?: string
  fullWidth?: boolean
  action?: ReactNode
  formatValue?: (value: number) => string
  /** Use heatmap grid instead of bar chart (journal consistency). */
  variant?: 'bars' | 'heatmap'
}

export function ChartPanel({
  title,
  subtitle,
  series,
  color = 'var(--color-accent)',
  height = 72,
  emptyMessage = 'No data yet — log activity to see trends.',
  zeroMessage = 'No activity in this period yet.',
  fullWidth,
  action,
  formatValue,
  variant = 'bars',
}: ChartPanelProps) {
  const hasPoints = series.data.length > 0
  const hasValues = series.data.some((v) => v > 0)

  return (
    <Panel title={title} subtitle={subtitle} fullWidth={fullWidth} action={action}>
      {!hasPoints ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">{emptyMessage}</p>
      ) : !hasValues ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">{zeroMessage}</p>
      ) : variant === 'heatmap' ? (
        <ActivityHeatmap data={series.data} labels={series.labels} activeColor={color} />
      ) : (
        <>
          <MiniBarChart
            data={series.data}
            labels={series.labels}
            height={height}
            color={color}
            formatValue={formatValue}
            showAxis
            showValues
          />
          {series.unit && (
            <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">Unit: {series.unit}</p>
          )}
        </>
      )}
    </Panel>
  )
}
