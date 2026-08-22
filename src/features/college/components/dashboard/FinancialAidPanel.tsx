import { useEffect, useRef, useState } from 'react'
import { Badge } from '@components/ui/Badge'
import { Panel } from '@components/ui/Panel'
import { ProgressBar } from '@components/ui/ProgressBar'
import { EmptyState } from '@components/ui/EmptyState'
import { ChecklistItemRow } from '../shared/ChecklistItemRow'
import { useCollege } from '../../hooks/useCollege'
import { useTasks } from '@features/tasks/hooks/useTasks'
import { buildJuniorFinancialAid, buildSeniorFinancialAid } from '../../data/templates'
import {
  checklistProgress,
  formatShortDate,
  generateId,
  isOverdue,
  progressVariant,
} from '../../utils'
import type { FinancialAidItem } from '../../types'

export function FinancialAidPanel() {
  const { userData, updateFinancialAid, isSeniorMode, onboardingComplete } = useCollege()
  const { createTask } = useTasks()
  const items = userData?.financialAid ?? []
  const completed = items.filter((i) => i.completed).length
  const progress = checklistProgress(
    items.map((i) => ({ key: 'financial_aid', label: i.label, completed: i.completed })),
  )
  const seedingRef = useRef(false)
  const [taskAddedId, setTaskAddedId] = useState<string | null>(null)

  useEffect(() => {
    if (!userData || !onboardingComplete || items.length > 0 || seedingRef.current) return
    seedingRef.current = true
    const gradYear = userData.resumeSettings.studentProfile?.graduationYear
    const template = isSeniorMode
      ? buildSeniorFinancialAid(gradYear)
      : buildJuniorFinancialAid(gradYear)
    void updateFinancialAid(template).catch(() => {
      seedingRef.current = false
    })
  }, [userData, onboardingComplete, isSeniorMode, items.length, updateFinancialAid])

  async function persist(next: FinancialAidItem[]) {
    if (!userData) return
    await updateFinancialAid(next)
  }

  async function toggle(id: string) {
    const financialAid = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    )
    await persist(financialAid)
  }

  async function updateDueDate(id: string, dueDate: string | null) {
    const financialAid = items.map((item) =>
      item.id === id ? { ...item, dueDate: dueDate || null } : item,
    )
    await persist(financialAid)
  }

  async function addItem() {
    await persist([
      ...items,
      { id: generateId(), label: 'New checklist item', completed: false, dueDate: null },
    ])
  }

  async function loadTemplate() {
    if (!userData) return
    const gradYear = userData.resumeSettings.studentProfile?.graduationYear
    const template = isSeniorMode
      ? buildSeniorFinancialAid(gradYear)
      : buildJuniorFinancialAid(gradYear)
    await updateFinancialAid(template)
  }

  async function addAsTask(item: FinancialAidItem) {
    try {
      await createTask({
        title: item.label,
        category: 'College',
        deadline: item.dueDate,
        priority: item.dueDate && isOverdue(item.dueDate) ? 'high' : 'medium',
        description: 'From financial planning checklist',
      })
      setTaskAddedId(item.id)
      window.setTimeout(() => setTaskAddedId(null), 2000)
    } catch {
      /* non-blocking */
    }
  }

  const overdueCount = items.filter((i) => !i.completed && i.dueDate && isOverdue(i.dueDate)).length

  return (
    <Panel
      fillHeight
      title={isSeniorMode ? 'Financial aid checklist' : 'Financial planning'}
      subtitle={`${completed} of ${items.length} complete`}
      badge={overdueCount > 0 ? <Badge variant="danger">{overdueCount} overdue</Badge> : undefined}
      action={
        <button
          type="button"
          onClick={() => void addItem()}
          className="text-xs text-[var(--color-accent-muted)] hover:underline"
        >
          + Add
        </button>
      }
    >
      {items.length > 0 && (
        <ProgressBar
          value={progress}
          label="Checklist progress"
          variant={progressVariant(progress)}
          size="sm"
          className="mb-3"
        />
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No checklist items yet"
          description={
            isSeniorMode
              ? 'Load FAFSA, CSS Profile, and scholarship deadlines for senior year.'
              : 'Load junior-year savings and scholarship research steps.'
          }
          action={
            <button
              type="button"
              onClick={() => void loadTemplate()}
              className="text-xs text-[var(--color-accent-muted)] hover:underline"
            >
              Load planning checklist
            </button>
          }
        />
      ) : (
        <ul className="space-y-1">
            {items.map((item) => {
              const overdue = !item.completed && item.dueDate && isOverdue(item.dueDate)
              return (
                <li
                  key={item.id}
                  className="rounded-[var(--radius-sm)] border border-transparent px-1 py-1 hover:border-[var(--color-border)]"
                >
                  <div className="flex flex-wrap items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <ChecklistItemRow
                        label={item.label}
                        completed={item.completed}
                        onToggle={() => void toggle(item.id)}
                      />
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <input
                        type="date"
                        value={item.dueDate ?? ''}
                        onChange={(e) => void updateDueDate(item.id, e.target.value || null)}
                        aria-label={`Due date for ${item.label}`}
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-1.5 py-1 text-xs text-[var(--color-text-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => void addAsTask(item)}
                        disabled={item.completed}
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 py-1 text-xs text-[var(--color-accent-muted)] hover:bg-[var(--color-surface-overlay)] disabled:opacity-40"
                      >
                        {taskAddedId === item.id ? 'Added' : '→ Task'}
                      </button>
                    </div>
                  </div>
                  {item.dueDate && !item.completed && (
                    <p
                      className={`ml-6 mt-0.5 text-xs ${overdue ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-tertiary)]'}`}
                    >
                      Due {formatShortDate(item.dueDate)}
                      {overdue ? ' · overdue' : ''}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
      )}
    </Panel>
  )
}
