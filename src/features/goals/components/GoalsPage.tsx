import { useCallback, useMemo, useState } from 'react'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { IconPlus } from '@components/ui/icons'
import { useOpenCreateFromQuery } from '@hooks/useOpenCreateFromQuery'
import { GoalCard } from './GoalCard'
import { GoalForm } from './GoalForm'
import { GoalToolbar } from './GoalToolbar'
import { useGoals } from '../hooks/useGoals'
import type { Goal, Milestone } from '../types'
import {
  DEFAULT_GOAL_FILTERS,
  type GoalFilters,
  type GoalSortDirection,
  type GoalSortField,
} from '../types'
import { filterGoals, getUniqueCategories, sortGoals } from '../utils'

export function GoalsPage() {
  const {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    restoreGoal,
    reload,
  } = useGoals()

  const [filters, setFilters] = useState<GoalFilters>(DEFAULT_GOAL_FILTERS)
  const [sortField, setSortField] = useState<GoalSortField>('target_date')
  const [sortDirection, setSortDirection] = useState<GoalSortDirection>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const categories = useMemo(() => getUniqueCategories(goals), [goals])

  const visibleGoals = useMemo(() => {
    const filtered = filterGoals(goals, filters)
    return sortGoals(filtered, sortField, sortDirection)
  }, [goals, filters, sortField, sortDirection])

  const openCreate = useCallback(() => {
    setEditingGoal(null)
    setModalOpen(true)
  }, [])

  useOpenCreateFromQuery(openCreate)

  function openEdit(goal: Goal) {
    setEditingGoal(goal)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingGoal(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this goal?')) return
    try {
      await deleteGoal(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete goal')
    }
  }

  async function handleArchive(id: string) {
    try {
      await archiveGoal(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive goal')
    }
  }

  async function handleRestore(id: string) {
    try {
      await restoreGoal(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to restore goal')
    }
  }

  async function handleMilestonesChange(
    id: string,
    milestones: Milestone[],
    progress: number,
  ) {
    try {
      const status = progress >= 100 ? 'completed' : undefined
      await updateGoal(id, {
        milestones,
        progress,
        ...(status ? { status } : {}),
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update milestones')
    }
  }

  async function handleFormSubmit(input: Parameters<typeof createGoal>[0]) {
    if (editingGoal) {
      await updateGoal(editingGoal.id, input)
    } else {
      await createGoal(input)
    }
    closeModal()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Goals
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Track long-term objectives and milestones
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <IconPlus width={16} height={16} />
          New goal
        </Button>
      </header>

      <GoalToolbar
        filters={filters}
        onFiltersChange={setFilters}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
        categories={categories}
        resultCount={visibleGoals.length}
        totalCount={goals.length}
      />

      {loading && (
        <p className="py-12 text-center text-sm text-[var(--color-text-tertiary)]">
          Loading goals…
        </p>
      )}

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
            Run the SQL migration in Supabase Dashboard → SQL Editor (
            <code>supabase/migrations/002_goals.sql</code>).
          </p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={reload}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && visibleGoals.length === 0 && (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {goals.length === 0
              ? 'No goals yet. Set your first long-term objective.'
              : 'No goals match your filters.'}
          </p>
          {goals.length === 0 && (
            <Button className="mt-4" onClick={openCreate}>
              Create goal
            </Button>
          )}
        </div>
      )}

      {!loading && !error && visibleGoals.length > 0 && (
        <ul className="space-y-4">
          {visibleGoals.map((goal) => (
            <li key={goal.id}>
              <GoalCard
                goal={goal}
                onEdit={openEdit}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onDelete={handleDelete}
                onMilestonesChange={handleMilestonesChange}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingGoal ? 'Edit goal' : 'New goal'}
      >
        <GoalForm
          key={editingGoal?.id ?? 'new'}
          goal={editingGoal}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}
