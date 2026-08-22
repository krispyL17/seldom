import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'muted'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]',
  success: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]',
  accent: 'bg-[var(--color-accent)]/15 text-[var(--color-accent-muted)]',
  muted: 'bg-white/5 text-[var(--color-text-tertiary)]',
}

/** Compact status label — used for recovery state, mood, overdue flags */
export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
