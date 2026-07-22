import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Adds a subtle glass overlay effect */
  glass?: boolean
}

/**
 * Surface container for grouping related content.
 * Uses raised surface color with optional glass-morphism.
 */
export function Card({ children, glass = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5',
        glass
          ? 'bg-[var(--color-surface-overlay)]/60 backdrop-blur-xl'
          : 'bg-[var(--color-surface-raised)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

/** Standard card header with title, optional description, and action slot */
export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
