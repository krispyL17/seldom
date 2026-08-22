import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { Panel } from '@components/ui/Panel'
import { EmptyState } from '@components/ui/EmptyState'
import { useCollege } from '../../hooks/useCollege'
import { getCollegePriorityActions } from '../../utils'
import type { CollegePriorityAction } from '../../types'
import { cn } from '@lib/utils'

function urgencyVariant(
  urgency: CollegePriorityAction['urgency'],
): 'danger' | 'warning' | 'muted' {
  switch (urgency) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'warning'
    default:
      return 'muted'
  }
}

export function CollegeFocusPanel() {
  const { colleges, activities, awards, projects, userData, isSeniorMode } = useCollege()
  const actions = getCollegePriorityActions(
    colleges,
    activities,
    awards,
    projects,
    userData,
    isSeniorMode,
  )

  return (
    <Panel
      fillHeight
      title="Your priorities"
      subtitle={
        isSeniorMode
          ? 'Based on deadlines, checklists & aid'
          : 'Based on your list, experience & planning'
      }
    >
      {actions.length === 0 ? (
        <EmptyState
          title="Looking good"
          description={
            isSeniorMode
              ? 'No urgent gaps right now — keep logging progress as deadlines approach.'
              : 'Keep building your school list and activity profile this year.'
          }
          action={
            <Link
              to="/college/advisor"
              className="text-xs text-[var(--color-accent-muted)] hover:underline"
            >
              Ask AI Coach for ideas
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {actions.map((action) => (
            <li key={action.id}>
              <Link
                to={action.to}
                className={cn(
                  'flex items-start justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]',
                  'bg-[var(--color-surface-overlay)]/50 px-3 py-2 transition-colors',
                  'hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-surface-overlay)]',
                )}
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--color-text-primary)]">{action.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{action.detail}</p>
                </div>
                <Badge variant={urgencyVariant(action.urgency)} className="shrink-0 capitalize">
                  {action.urgency}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
