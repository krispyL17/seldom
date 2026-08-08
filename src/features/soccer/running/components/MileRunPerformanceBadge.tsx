import { Badge } from '@components/ui/Badge'
import type { MileRunPerformanceTag } from '../utils'

const TAG_CONFIG: Record<
  MileRunPerformanceTag,
  { variant: 'success' | 'accent' | 'warning'; label: string }
> = {
  pr: { variant: 'success', label: 'PR' },
  above_avg: { variant: 'accent', label: 'Above avg' },
  below_avg: { variant: 'warning', label: 'Below avg' },
}

interface MileRunPerformanceBadgeProps {
  tag: MileRunPerformanceTag
}

/** Compact performance tag for mile runs on dashboards and summaries. */
export function MileRunPerformanceBadge({ tag }: MileRunPerformanceBadgeProps) {
  const { variant, label } = TAG_CONFIG[tag]
  return (
    <Badge variant={variant} className="!px-1.5 !py-0 !text-[9px] normal-case tracking-normal">
      {label}
    </Badge>
  )
}
