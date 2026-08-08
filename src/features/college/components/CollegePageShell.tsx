import type { ReactNode } from 'react'
import { cn } from '@lib/utils'

interface CollegePageShellProps {
  children: ReactNode
  className?: string
}

/** Viewport-fitted college tab content — no page scroll. */
export function CollegePageShell({ children, className }: CollegePageShellProps) {
  return (
    <div className={cn('college-page-fit flex h-full min-h-0 flex-col gap-2 overflow-hidden', className)}>
      {children}
    </div>
  )
}

interface CollegePageGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  rows?: 1 | 2 | 3
  className?: string
}

export function CollegePageGrid({ children, columns = 2, rows = 2, className }: CollegePageGridProps) {
  return (
    <div
      className={cn(
        'college-page-grid min-h-0 flex-1',
        columns === 1 && 'college-page-grid--1col',
        columns === 3 && 'college-page-grid--3col',
        rows === 1 && 'college-page-grid--1row',
        rows === 3 && 'college-page-grid--3row',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface CollegeScrollRegionProps {
  children: ReactNode
  className?: string
}

/** Internal scroll for long lists inside a fixed tab. */
export function CollegeScrollRegion({ children, className }: CollegeScrollRegionProps) {
  return (
    <div className={cn('college-scroll-region min-h-0 flex-1 overflow-y-auto pr-1', className)}>
      {children}
    </div>
  )
}
