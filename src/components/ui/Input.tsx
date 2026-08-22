import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

/**
 * Styled text input with label and error message for forms.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-medium text-[var(--color-text-secondary)]"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'h-10 w-full rounded-[var(--radius-md)] border bg-[var(--color-surface-raised)] px-3 text-sm',
          'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
          'transition-[border-color,box-shadow] duration-150',
          'focus:border-[var(--color-accent-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-subtle)]',
          error
            ? 'border-[var(--color-danger)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
