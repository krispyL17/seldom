import type { ReactNode } from 'react'
import { cn } from '@lib/utils'

interface AdaptiveScrollRegionProps {
  children: ReactNode
  className?: string
}

/**
 * Tab shell scroll — panels expand with content; this region scrolls when they exceed the viewport.
 */
export function AdaptiveScrollRegion({ children, className }: AdaptiveScrollRegionProps) {
  return (
    <div className={cn('adaptive-scroll-region min-h-0 flex-1', className)}>{children}</div>
  )
}
