import { useMemo } from 'react'
import { Button } from '@components/ui/Button'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import {
  encodeSessionTabCategory,
  getOrphanedSessionTabLabel,
  getSessionTabOptions,
  isOrphanedSessionCategory,
} from '../../utils/sessionTabCategory'
import { cn } from '@lib/utils'

interface SessionTabSelectProps {
  value: string | null
  onChange: (tabKey: string | null) => void
  className?: string
}

export function SessionTabSelect({ value, onChange, className }: SessionTabSelectProps) {
  const { development } = useAthleteDevelopment()
  const options = useMemo(() => getSessionTabOptions(development.customTabs), [development.customTabs])

  const builtIn = options.filter((o) => o.group === 'Built-in')
  const custom = options.filter((o) => o.group === 'Custom')

  const orphaned = useMemo(() => {
    if (!value) return false
    if (options.some((o) => o.value === value)) return false
    return isOrphanedSessionCategory(encodeSessionTabCategory(value), development.customTabs)
  }, [value, options, development.customTabs])

  const orphanedLabel = useMemo(() => {
    if (!value || !orphaned) return null
    return getOrphanedSessionTabLabel(encodeSessionTabCategory(value)) ?? value
  }, [value, orphaned])

  return (
    <div className={cn('space-y-1.5', className)}>
      {orphaned && orphanedLabel && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 px-3 py-2">
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Category <strong>{orphanedLabel}</strong> was removed. Choose <strong>No category</strong> and save to
            clear it.
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={() => onChange(null)}
          >
            Clear category
          </Button>
        </div>
      )}

      <label className="block text-xs font-medium text-[var(--color-text-secondary)]">
        Category (optional)
      </label>
      <select
        value={orphaned ? '' : (value ?? '')}
        onChange={(e) => onChange(e.target.value || null)}
        className={cn(
          'h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
          'bg-[var(--color-surface-overlay)] px-3 text-sm text-[var(--color-text-primary)]',
          'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
        )}
      >
        <option value="">No category</option>
        {builtIn.length > 0 && (
          <optgroup label="Built-in tabs">
            {builtIn.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        )}
        {custom.length > 0 && (
          <optgroup label="Custom tabs">
            {custom.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <p className="text-[10px] text-[var(--color-text-tertiary)]">
        File this session under a performance tab to show it on that tab&apos;s list.
      </p>
    </div>
  )
}
