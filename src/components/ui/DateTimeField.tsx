import { cn } from '@lib/utils'

interface DateTimeFieldProps {
  label: string
  dateValue: string
  timeValue: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  dateOnly?: boolean
  className?: string
}

const fieldClass = cn(
  'h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
  'bg-[var(--color-surface-overlay)] px-3 text-sm text-[var(--color-text-primary)]',
  'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
  '[color-scheme:dark]',
)

/** Split date + time inputs — easier to use than native datetime-local. */
export function DateTimeField({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateOnly = false,
  className,
}: DateTimeFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <span className="block text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>
      <div className={cn('grid gap-2', dateOnly ? 'grid-cols-1' : 'grid-cols-2')}>
        <input
          type="date"
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
          aria-label={`${label} date`}
          className={fieldClass}
        />
        {!dateOnly && (
          <input
            type="time"
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            aria-label={`${label} time`}
            className={fieldClass}
          />
        )}
      </div>
    </div>
  )
}

/** Split ISO datetime into date + time parts for DateTimeField. */
export function splitIsoDateTime(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return { date: '', time: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: '', time: '' }
  const date = d.toISOString().slice(0, 10)
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return { date, time }
}

/** Combine date + optional time into ISO string (or null). */
export function combineDateTime(date: string, time: string, dateOnly = false): string | null {
  if (!date) return null
  if (dateOnly) return new Date(`${date}T12:00:00`).toISOString()
  const t = time || '23:59'
  return new Date(`${date}T${t}:00`).toISOString()
}
