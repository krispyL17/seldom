import { cn } from '@lib/utils'
import { IconSearch } from '@components/ui/icons'
import type { GoalFilters, GoalSortDirection, GoalSortField } from '@features/goals/types'

interface GoalToolbarProps {
  filters: GoalFilters
  onFiltersChange: (filters: GoalFilters) => void
  sortField: GoalSortField
  sortDirection: GoalSortDirection
  onSortFieldChange: (field: GoalSortField) => void
  onSortDirectionChange: (direction: GoalSortDirection) => void
  categories: string[]
  resultCount: number
  totalCount: number
}

const selectClass = cn(
  'h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)]',
  'px-2.5 text-xs text-[var(--color-text-primary)]',
  'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
)

export function GoalToolbar({
  filters,
  onFiltersChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  categories,
  resultCount,
  totalCount,
}: GoalToolbarProps) {
  return (
    <div className="space-y-3">
      <label className="relative block">
        <span className="sr-only">Search goals</span>
        <IconSearch
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
          aria-hidden
        />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          placeholder="Search goals…"
          className={cn(
            'h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
            'bg-[var(--color-surface-overlay)] pl-9 pr-4 text-sm text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-tertiary)]',
            'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
          )}
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: e.target.value as GoalFilters['status'],
            })
          }
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
          className={selectClass}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div className="ml-auto flex gap-2">
          <select
            value={sortField}
            onChange={(e) => onSortFieldChange(e.target.value as GoalSortField)}
            className={selectClass}
            aria-label="Sort by"
          >
            <option value="target_date">Target date</option>
            <option value="progress">Progress</option>
            <option value="title">Title</option>
            <option value="created_at">Created</option>
          </select>

          <select
            value={sortDirection}
            onChange={(e) => onSortDirectionChange(e.target.value as GoalSortDirection)}
            className={selectClass}
            aria-label="Sort direction"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-[var(--color-text-tertiary)]">
        Showing {resultCount} of {totalCount} goals
      </p>
    </div>
  )
}
