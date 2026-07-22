import { IconCheck } from '@components/ui/icons'
import { cn } from '@lib/utils'

interface ChecklistItemRowProps {
  label: string
  completed: boolean
  disabled?: boolean
  onToggle?: () => void
}

export function ChecklistItemRow({
  label,
  completed,
  disabled = false,
  onToggle,
}: ChecklistItemRowProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-2.5 rounded-[var(--radius-sm)] py-1.5',
        !disabled && onToggle && 'cursor-pointer hover:bg-[var(--color-surface-overlay)]',
        disabled && 'opacity-60',
      )}
    >
      <input
        type="checkbox"
        checked={completed}
        disabled={disabled || !onToggle}
        onChange={onToggle}
        className="sr-only"
      />
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
          completed
            ? 'border-[var(--color-success)] bg-[var(--color-success)]/20 text-[var(--color-success)]'
            : 'border-[var(--color-border-strong)]',
        )}
      >
        {completed && <IconCheck />}
      </span>
      <span
        className={cn(
          'text-xs',
          completed
            ? 'text-[var(--color-text-tertiary)] line-through'
            : 'text-[var(--color-text-primary)]',
        )}
      >
        {label}
      </span>
    </label>
  )
}
