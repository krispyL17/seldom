import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@lib/utils'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** Accessible label — required for icon-only buttons */
  label: string
  /** Show a notification dot indicator */
  dot?: boolean
}

/**
 * Circular icon button used in the top bar and mobile header.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ children, label, dot = false, className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          'relative inline-flex h-9 w-9 items-center justify-center rounded-full',
          'text-[var(--color-text-secondary)] transition-colors duration-150',
          'hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
          className,
        )}
        {...props}
      >
        {children}
        {dot && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-accent)]" />
        )}
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'
