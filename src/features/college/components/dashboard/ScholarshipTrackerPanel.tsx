import { useEffect, useRef, useState } from 'react'
import { Panel } from '@components/ui/Panel'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { EmptyState } from '@components/ui/EmptyState'
import { useCollege } from '../../hooks/useCollege'
import {
  buildJuniorSummerPrograms,
  buildSeniorScholarships,
} from '../../data/templates'
import { formatCurrency, formatShortDate, scholarshipStatusLabel, generateId } from '../../utils'
import type { Scholarship, ScholarshipStatus } from '../../types'

const STATUSES: ScholarshipStatus[] = [
  'not_started',
  'in_progress',
  'submitted',
  'awarded',
  'rejected',
]

export function ScholarshipTrackerPanel() {
  const { userData, colleges, isSeniorMode, onboardingComplete, updateScholarships } = useCollege()
  const scholarships = userData?.scholarships ?? []
  const seedingRef = useRef(false)
  const [name, setName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [amount, setAmount] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!userData || !onboardingComplete || scholarships.length > 0 || seedingRef.current) return
    seedingRef.current = true
    const gradYear = userData.resumeSettings.studentProfile?.graduationYear
    const template = isSeniorMode
      ? buildSeniorScholarships(gradYear)
      : buildJuniorSummerPrograms(gradYear)
    void updateScholarships(template).catch(() => {
      seedingRef.current = false
    })
  }, [userData, onboardingComplete, isSeniorMode, scholarships.length, updateScholarships])

  async function addScholarship() {
    if (!userData || !name.trim()) return
    setAdding(true)
    try {
      const next: Scholarship = {
        id: generateId(),
        name: name.trim(),
        deadline: deadline || new Date().toISOString().slice(0, 10),
        amount: Number(amount) || 0,
        status: 'not_started',
        requirements: [],
      }
      await updateScholarships([...scholarships, next])
      setName('')
      setDeadline('')
      setAmount('')
    } finally {
      setAdding(false)
    }
  }

  async function updateStatus(id: string, status: ScholarshipStatus) {
    if (!userData) return
    await updateScholarships(
      scholarships.map((s) => (s.id === id ? { ...s, status } : s)),
    )
  }

  async function remove(id: string) {
    if (!userData) return
    await updateScholarships(scholarships.filter((s) => s.id !== id))
  }

  async function loadTemplate() {
    if (!userData) return
    const gradYear = userData.resumeSettings.studentProfile?.graduationYear
    const template = isSeniorMode
      ? buildSeniorScholarships(gradYear)
      : buildJuniorSummerPrograms(gradYear)
    await updateScholarships(template)
  }

  const title = isSeniorMode ? 'Scholarships' : 'Summer programs & aid'
  const addLabel = isSeniorMode ? 'Add scholarship' : 'Add program'

  return (
    <Panel fillHeight title={title} subtitle={`${scholarships.length} tracked`}>
      <div className="mb-3 grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)]/40 p-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <Input
          label={addLabel}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isSeniorMode ? 'Scholarship name' : 'Program name'}
        />
        <Input
          label="Deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <Input
          label={isSeniorMode ? 'Amount ($)' : 'Cost ($)'}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
        />
        <div className="flex items-end">
          <Button
            type="button"
            size="sm"
            disabled={adding || !name.trim()}
            onClick={() => void addScholarship()}
          >
            Add
          </Button>
        </div>
      </div>

      {scholarships.length === 0 ? (
        <EmptyState
          title={isSeniorMode ? 'No scholarships yet' : 'No programs yet'}
          description={
            isSeniorMode
              ? 'Track external scholarships and their deadlines here.'
              : 'Track summer programs, camps, and merit opportunities.'
          }
          action={
            <button
              type="button"
              onClick={() => void loadTemplate()}
              className="text-[11px] text-[var(--color-accent-muted)] hover:underline"
            >
              Load starter list
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] text-[var(--color-text-tertiary)]">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Deadline</th>
                <th className="pb-2 font-medium">{isSeniorMode ? 'Amount' : 'Cost'}</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {scholarships.map((s) => {
                const college = s.collegeId
                  ? colleges.find((c) => c.id === s.collegeId)
                  : undefined
                return (
                  <tr key={s.id} className="border-t border-[var(--color-border)]">
                    <td className="py-2 pr-2 text-[var(--color-text-primary)]">
                      {s.name}
                      {college && (
                        <span className="block text-[10px] text-[var(--color-text-tertiary)]">
                          {college.name}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-2 tabular-nums text-[var(--color-text-secondary)]">
                      {formatShortDate(s.deadline)}
                    </td>
                    <td className="py-2 pr-2 text-[var(--color-text-secondary)]">
                      {s.amount > 0 ? formatCurrency(s.amount) : '—'}
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={s.status}
                        onChange={(e) =>
                          void updateStatus(s.id, e.target.value as ScholarshipStatus)
                        }
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-1.5 py-1 text-[10px] text-[var(--color-text-primary)]"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {scholarshipStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => void remove(s.id)}
                        className="text-[10px] text-[var(--color-danger)] hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}
