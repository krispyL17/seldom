import { Panel } from '@components/ui/Panel'
import { EmptyState } from '@components/ui/EmptyState'
import { ChecklistItemRow } from '../shared/ChecklistItemRow'
import { useCollege } from '../../hooks/useCollege'
import { generateId } from '../../utils'

export function FinancialAidPanel() {
  const { userData, updateFinancialAid, isSeniorMode } = useCollege()
  const items = userData?.financialAid ?? []
  const completed = items.filter((i) => i.completed).length

  async function toggle(id: string) {
    if (!userData) return
    const financialAid = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    )
    await updateFinancialAid(financialAid)
  }

  async function addItem() {
    if (!userData) return
    await updateFinancialAid([
      ...items,
      { id: generateId(), label: 'New checklist item', completed: false, dueDate: null },
    ])
  }

  return (
    <Panel
      title={isSeniorMode ? 'Financial Aid Checklist' : 'Financial Planning'}
      subtitle={`${completed} of ${items.length} complete`}
      action={
        <button
          type="button"
          onClick={addItem}
          className="text-[10px] text-[var(--color-accent-muted)] hover:underline"
        >
          + Add
        </button>
      }
    >
      <ul className="space-y-1">
        {items.length === 0 ? (
          <EmptyState
            title="No checklist items yet"
            description={
              isSeniorMode
                ? 'Add FAFSA, CSS Profile, and scholarship deadlines as you go.'
                : 'Track savings goals and scholarship research for junior year.'
            }
            action={
              <button
                type="button"
                onClick={addItem}
                className="text-[11px] text-[var(--color-accent-muted)] hover:underline"
              >
                Add first item
              </button>
            }
          />
        ) : (
          items.map((item) => (
            <li key={item.id}>
              <ChecklistItemRow
                label={item.label}
                completed={item.completed}
                onToggle={() => toggle(item.id)}
              />
            </li>
          ))
        )}
      </ul>
    </Panel>
  )
}
