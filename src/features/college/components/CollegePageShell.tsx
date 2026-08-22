import type { ReactNode } from 'react'
import { cn } from '@lib/utils'

interface CollegePageShellProps {
  children: ReactNode
  className?: string
}

/** College tab content — panels expand; CollegeLayout tab shell scrolls when needed. */
export function CollegePageShell({ children, className }: CollegePageShellProps) {
  return <div className={cn('college-page-fit flex flex-col gap-2', className)}>{children}</div>
}

interface CollegePageGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  rows?: 1 | 2 | 3 | 4
  className?: string
}

export function CollegePageGrid({ children, columns = 2, rows = 2, className }: CollegePageGridProps) {
  return (
    <div
      className={cn(
        'college-page-grid',
        columns === 1 && 'college-page-grid--1col',
        columns === 3 && 'college-page-grid--3col',
        rows === 1 && 'college-page-grid--1row',
        rows === 3 && 'college-page-grid--3row',
        rows === 4 && 'college-page-grid--4row',
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

/** Long tab sections — expand with content (tab shell scrolls). */
export function CollegeScrollRegion({ children, className }: CollegeScrollRegionProps) {
  return (
    <div className={cn('college-scroll-region pr-1', className)}>
      {children}
    </div>
  )
}
