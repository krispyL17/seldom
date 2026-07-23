import type { ReactNode } from 'react'
import { cn } from '@lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('py-6 text-center', className)}>
      <p className="text-xs font-medium text-[var(--color-text-secondary)]">{title}</p>
      {description && (
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
