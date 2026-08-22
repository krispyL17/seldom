import { cn } from '@lib/utils'

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  className?: string
}

/** Minimal inline sparkline for metric tiles. */
export function Sparkline({
  data,
  color = 'var(--color-accent)',
  height = 20,
  className,
}: SparklineProps) {
  if (data.length === 0 || data.every((v) => v <= 0)) return null

  const max = Math.max(...data, 1)
  const width = Math.max(data.length * 6, 24)

  const points = data
    .map((value, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width
      const y = height - (value / max) * (height - 2) - 1
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('mt-1 w-full max-w-[88px]', className)}
      height={height}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity={0.9}
      />
    </svg>
  )
}
