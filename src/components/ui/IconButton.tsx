import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@lib/utils'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** Accessible label — required for icon-only buttons */
  label: string
  /** Show a notification dot indicator */
  dot?: boolean
  /** Numeric badge (e.g. unread notification count) */
  badgeCount?: number
}

/**
 * Circular icon button used in the top bar and mobile header.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ children, label, dot = false, badgeCount = 0, className, ...props }, ref) {
    const showBadge = badgeCount > 0

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          'relative inline-flex h-10 w-10 min-h-10 min-w-10 items-center justify-center rounded-full',
          'text-[var(--color-text-secondary)] transition-colors duration-150',
          'hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
          className,
        )}
        {...props}
      >
        {children}
        {showBadge ? (
          <span
            className={cn(
              'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full',
              'bg-[var(--color-danger)] px-1 text-xs font-bold leading-none text-white',
              'ring-2 ring-[var(--color-surface-base)]',
            )}
            aria-hidden
          >
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        ) : (
          dot && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          )
        )}
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'
