import { Panel } from '@components/ui/Panel'
import { StatusBadge } from '../shared/StatusBadge'
import type { ApplicationStatus, College } from '../../types'
import { APPLICATION_STATUSES, JUNIOR_STATUSES } from '../../types'
import { statusLabel } from '../../utils'
import { useCollege } from '../../hooks/useCollege'
import { cn } from '@lib/utils'

interface ApplicationStatusSectionProps {
  college: College
  onStatusChange?: (status: College['status']) => void
}

export function ApplicationStatusSection({
  college,
  onStatusChange,
}: ApplicationStatusSectionProps) {
  const { isSeniorMode } = useCollege()
  const statuses: ApplicationStatus[] = isSeniorMode ? APPLICATION_STATUSES : JUNIOR_STATUSES
  const currentIndex = statuses.indexOf(
    statuses.includes(college.status) ? college.status : statuses[0],
  )

  return (
    <Panel
      title={isSeniorMode ? 'Application Status' : 'Research Status'}
      subtitle={isSeniorMode ? 'Current pipeline stage' : 'Where this school fits right now'}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={college.status} />
        {onStatusChange && (
          <select
            value={statuses.includes(college.status) ? college.status : statuses[0]}
            onChange={(e) => onStatusChange(e.target.value as College['status'])}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1 text-[11px] text-[var(--color-text-primary)]"
          >
            {(isSeniorMode ? APPLICATION_STATUSES : JUNIOR_STATUSES).map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="overflow-x-auto pb-1">
        <ol className={cn('flex items-center gap-0', isSeniorMode ? 'min-w-[640px]' : 'min-w-[200px]')}>
          {statuses.map((status, index) => {
            const isPast = index < currentIndex
            const isCurrent =
              status === (statuses.includes(college.status) ? college.status : statuses[0])
            const isRejected = college.status === 'rejected' && status === 'rejected'
            const isTerminal =
              status === 'accepted' || status === 'committed' || status === 'rejected'

            return (
              <li key={status} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5 px-1">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold tabular-nums',
                      isCurrent
                        ? 'bg-[var(--color-accent)] text-white ring-2 ring-[var(--color-accent)]/30'
                        : isPast
                          ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                          : 'bg-[var(--color-surface-overlay)] text-[var(--color-text-tertiary)]',
                      isRejected &&
                        isCurrent &&
                        'bg-[var(--color-danger)] text-white ring-[var(--color-danger)]/30',
                    )}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      'max-w-[4.5rem] text-center text-[9px] leading-tight',
                      isCurrent
                        ? 'font-medium text-[var(--color-accent-muted)]'
                        : isPast
                          ? 'text-[var(--color-text-secondary)]'
                          : 'text-[var(--color-text-tertiary)]',
                      isTerminal && isCurrent && status === 'rejected' && 'text-[var(--color-danger)]',
                      isTerminal && isCurrent && status !== 'rejected' && 'text-[var(--color-success)]',
                    )}
                  >
                    {statusLabel(status)}
                  </span>
                </div>
                {index < statuses.length - 1 && (
                  <div
                    className={cn(
                      'mb-5 h-px flex-1',
                      index < currentIndex
                        ? 'bg-[var(--color-success)]/40'
                        : 'bg-[var(--color-border)]',
                    )}
                    aria-hidden
                  />
                )}
              </li>
            )
          })}
        </ol>
      </div>

      {!isSeniorMode && (
        <p className="mt-3 text-[10px] text-[var(--color-text-tertiary)]">
          Full application pipeline unlocks when you start senior year.
        </p>
      )}
    </Panel>
  )
}
