import { cn } from '@lib/utils'
import type { TaskFilters, TaskSortDirection, TaskSortField } from '@features/tasks/types'
import { IconSearch } from '@components/ui/icons'

interface TaskToolbarProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  sortField: TaskSortField
  sortDirection: TaskSortDirection
  onSortFieldChange: (field: TaskSortField) => void
  onSortDirectionChange: (direction: TaskSortDirection) => void
  categories: string[]
  resultCount: number
  totalCount: number
}

const selectClass = cn(
  'h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)]',
  'px-2.5 text-xs text-[var(--color-text-primary)]',
  'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
)

export function TaskToolbar({
  filters,
  onFiltersChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  categories,
  resultCount,
  totalCount,
}: TaskToolbarProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <label className="relative block">
        <span className="sr-only">Search tasks</span>
        <IconSearch
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
          aria-hidden
        />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks…"
          className={cn(
            'h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
            'bg-[var(--color-surface-overlay)] pl-9 pr-4 text-sm text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-tertiary)]',
            'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
          )}
        />
      </label>

      {/* Filters + sort */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: e.target.value as TaskFilters['status'],
            })
          }
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              priority: e.target.value as TaskFilters['priority'],
            })
          }
          className={selectClass}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) =>
            onFiltersChange({ ...filters, category: e.target.value })
          }
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
            onChange={(e) => onSortFieldChange(e.target.value as TaskSortField)}
            className={selectClass}
            aria-label="Sort by"
          >
            <option value="deadline">Deadline</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
            <option value="created_at">Created</option>
          </select>

          <select
            value={sortDirection}
            onChange={(e) =>
              onSortDirectionChange(e.target.value as TaskSortDirection)
            }
            className={selectClass}
            aria-label="Sort direction"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-[var(--color-text-tertiary)]">
        Showing {resultCount} of {totalCount} tasks
      </p>
    </div>
  )
}
