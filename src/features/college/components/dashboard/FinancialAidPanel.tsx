import { useEffect, useRef } from 'react'
import { Panel } from '@components/ui/Panel'
import { EmptyState } from '@components/ui/EmptyState'
import { ChecklistItemRow } from '../shared/ChecklistItemRow'
import { useCollege } from '../../hooks/useCollege'
import { buildJuniorFinancialAid, buildSeniorFinancialAid } from '../../data/templates'
import { formatShortDate, generateId } from '../../utils'

export function FinancialAidPanel() {
  const { userData, updateFinancialAid, isSeniorMode, onboardingComplete } = useCollege()
  const items = userData?.financialAid ?? []
  const completed = items.filter((i) => i.completed).length
  const seedingRef = useRef(false)

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

  async function loadTemplate() {
    if (!userData) return
    const gradYear = userData.resumeSettings.studentProfile?.graduationYear
    const template = isSeniorMode
      ? buildSeniorFinancialAid(gradYear)
      : buildJuniorFinancialAid(gradYear)
    await updateFinancialAid(template)
  }

  return (
    <Panel
      fillHeight
      title={isSeniorMode ? 'Financial aid checklist' : 'Financial planning'}
      subtitle={`${completed} of ${items.length} complete`}
      action={
        <button
          type="button"
          onClick={() => void addItem()}
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
                ? 'Load FAFSA, CSS Profile, and scholarship deadlines for senior year.'
                : 'Load junior-year savings and scholarship research steps.'
            }
            action={
              <button
                type="button"
                onClick={() => void loadTemplate()}
                className="text-[11px] text-[var(--color-accent-muted)] hover:underline"
              >
                Load planning checklist
              </button>
            }
          />
        ) : (
          items.map((item) => (
            <li key={item.id}>
              <ChecklistItemRow
                label={
                  item.dueDate
                    ? `${item.label} · due ${formatShortDate(item.dueDate)}`
                    : item.label
                }
                completed={item.completed}
                onToggle={() => void toggle(item.id)}
              />
            </li>
          ))
        )}
      </ul>
    </Panel>
  )
}
