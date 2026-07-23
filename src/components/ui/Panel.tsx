import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@lib/utils'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  badge?: ReactNode
  action?: ReactNode
  children: ReactNode
  /** Span full width in dashboard grid */
  fullWidth?: boolean
  noPadding?: boolean
}

/**
 * FM-inspired information panel — dense, self-contained widget with header rail.
 * Philosophy: hierarchical data blocks, subtle depth, professional command-center feel.
 */
export function Panel({
  title,
  subtitle,
  badge,
  action,
  children,
  fullWidth = false,
  noPadding = false,
  className,
  ...props
}: PanelProps) {
  return (
    <section
      className={cn(
        'panel flex flex-col overflow-hidden rounded-[var(--radius-lg)]',
        'border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
        'shadow-[var(--shadow-panel)] transition-shadow duration-200 hover:shadow-[var(--shadow-panel-hover)]',
        fullWidth && 'lg:col-span-2',
        className,
      )}
      {...props}
    >
      {/* Header rail */}
      <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
              {title}
            </h3>
            {badge}
          </div>
          {subtitle && (
            <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-tertiary)]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>

      {/* Body */}
      <div className={cn('flex-1', noPadding ? '' : 'p-4')}>{children}</div>
    </section>
  )
}

/** Dense label / value row used inside panels */
export function DataRow({
  label,
  value,
  subValue,
  highlight,
  className,
}: {
  label: string
  value: ReactNode
  subValue?: string
  highlight?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-[var(--color-border)] py-2.5 last:border-0',
        highlight && 'bg-[var(--color-danger)]/5 -mx-4 px-4 rounded-sm',
        className,
      )}
    >
      <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      <div className="text-right">
        <span className="text-xs font-medium tabular-nums text-[var(--color-text-primary)]">
          {value}
        </span>
        {subValue && (
          <p className="text-[10px] text-[var(--color-text-tertiary)]">{subValue}</p>
        )}
      </div>
    </div>
  )
}

/** Section divider with optional label inside a panel */
export function PanelDivider({ label }: { label?: string }) {
  if (!label) {
    return <hr className="my-3 border-[var(--color-border)]" />
  }
  return (
    <div className="my-3 flex items-center gap-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  )
}

/** Standard action link styled for panel headers */
export function PanelActionLink({
  children,
  to,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { to?: string }) {
  const styles =
    'rounded-sm text-[10px] font-medium text-[var(--color-accent-muted)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'

  if (to) {
    return (
      <Link to={to} className={cn(styles, className)}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={cn(styles, className)} {...props}>
      {children}
    </button>
  )
}
