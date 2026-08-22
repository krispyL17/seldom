import { Link } from 'react-router-dom'
import { APP_CONFIG } from '@config/env'
import { cn } from '@lib/utils'

/** Seldom wordmark color — matches favicon stroke */
export const SELDOM_MARK_COLOR = '#0a84ff'

interface SeldomMarkProps {
  className?: string
  /** Wrap in home link */
  linked?: boolean
}

/** Minimal blue "S" logo mark */
export function SeldomMark({ className, linked = false }: SeldomMarkProps) {
  const mark = (
    <span
      className={cn(
        'font-display text-[1.35rem] font-bold leading-none tracking-tight',
        className,
      )}
      style={{ color: SELDOM_MARK_COLOR }}
      aria-hidden
    >
      S
    </span>
  )

  if (linked) {
    return (
      <Link
        to="/"
        aria-label="Seldom home"
        className="inline-flex items-center justify-center rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        {mark}
      </Link>
    )
  }

  return mark
}

interface SidebarBrandProps {
  /** Larger text for mobile drawer */
  size?: 'default' | 'compact'
}

/** Drawer header — blue S + wordmark */
export function SidebarBrand({ size = 'default' }: SidebarBrandProps) {
  const compact = size === 'compact'

  return (
    <div className="flex items-center gap-2.5">
      <SeldomMark className={compact ? 'text-xl' : 'text-2xl'} />
      <span
        className={cn(
          'font-display font-semibold tracking-tight text-[var(--color-text-primary)]',
          compact ? 'text-lg' : 'text-xl',
        )}
      >
        {APP_CONFIG.name}
      </span>
    </div>
  )
}

/** Version label for sidebar footer */
export function SidebarFooter() {
  return (
    <div className="border-t border-[var(--color-border)] px-4 py-2.5">
      <p className="text-xs font-medium text-[var(--color-text-tertiary)]">
        v{APP_CONFIG.version}
      </p>
    </div>
  )
}
