import type { ReactNode } from 'react'
import { cn } from '@lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  /** Tighter padding for dashboard panels */
  compact?: boolean
}

export function EmptyState({ title, description, action, className, compact = false }: EmptyStateProps) {
  return (
    <div className={cn(compact ? 'py-3 text-center' : 'py-6 text-center', className)}>
      <p className="text-xs font-medium text-[var(--color-text-secondary)]">{title}</p>
      {description && (
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
