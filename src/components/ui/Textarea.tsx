import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
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
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'min-h-[88px] w-full resize-y rounded-[var(--radius-md)] border bg-[var(--color-surface-overlay)] px-3 py-2 text-sm',
          'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
          'transition-colors duration-150',
          'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
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
