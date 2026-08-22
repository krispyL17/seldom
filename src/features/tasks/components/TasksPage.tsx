import { useCallback, useMemo, useState } from 'react'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { IconPlus } from '@components/ui/icons'
import { useOpenCreateFromQuery } from '@hooks/useOpenCreateFromQuery'
import { deleteError, updateError } from '@lib/userFacingError'
import { TaskForm } from './TaskForm'
import { TaskItem } from './TaskItem'
import { TaskToolbar } from './TaskToolbar'
import { useTasks } from '../hooks/useTasks'
import type { Task } from '../types'
import {
  DEFAULT_TASK_FILTERS,
  type TaskFilters,
  type TaskSortDirection,
  type TaskSortField,
} from '../types'
import { filterTasks, getUniqueCategories, sortTasks } from '../utils'

export function TasksPage() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, toggleComplete, reload } =
    useTasks()

  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS)
  const [sortField, setSortField] = useState<TaskSortField>('deadline')
  const [sortDirection, setSortDirection] = useState<TaskSortDirection>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const categories = useMemo(() => getUniqueCategories(tasks), [tasks])
  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks])

  const visibleTasks = useMemo(() => {
    const filtered = filterTasks(tasks, filters)
    return sortTasks(filtered, sortField, sortDirection)
  }, [tasks, filters, sortField, sortDirection])

  const openCreate = useCallback(() => {
    setEditingTask(null)
    setModalOpen(true)
  }, [])

  useOpenCreateFromQuery(openCreate)

  function openEdit(task: Task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingTask(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(id)
    } catch (err) {
      alert(deleteError('this task', err))
    }
  }

  async function handleToggle(id: string, completed: boolean) {
    try {
      await toggleComplete(id, completed)
    } catch (err) {
      alert(updateError('this task', err))
    }
  }

  async function handleFormSubmit(input: Parameters<typeof createTask>[0]) {
    if (editingTask) {
      await updateTask(editingTask.id, input)
    } else {
      await createTask(input)
    }
    closeModal()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Tasks
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage your daily priorities and training items
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <IconPlus width={16} height={16} />
          New task
        </Button>
      </header>

      <TaskToolbar
        filters={filters}
        onFiltersChange={setFilters}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
        categories={categories}
        resultCount={visibleTasks.length}
        totalCount={tasks.length}
        completedCount={completedCount}
      />

      {loading && (
        <p className="py-12 text-center text-sm text-[var(--color-text-tertiary)]">
          Loading tasks…
        </p>
      )}

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => void reload()}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && visibleTasks.length === 0 && (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {tasks.length === 0
              ? 'No tasks yet. Create your first one.'
              : filters.status === 'active' && completedCount > 0
                ? 'All caught up — nothing open right now.'
                : filters.status === 'completed' && completedCount === 0
                  ? 'No completed tasks yet.'
                  : 'No tasks match your filters.'}
          </p>
          {tasks.length === 0 ? (
            <Button className="mt-4" onClick={openCreate}>
              Create task
            </Button>
          ) : null}
        </div>
      )}

      {!loading && !error && visibleTasks.length > 0 && (
        <ul className="space-y-3">
          {visibleTasks.map((task) => (
            <li key={task.id}>
              <TaskItem
                task={task}
                onToggle={handleToggle}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingTask ? 'Edit task' : 'New task'}
      >
        <TaskForm
          key={editingTask?.id ?? 'new'}
          task={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}
