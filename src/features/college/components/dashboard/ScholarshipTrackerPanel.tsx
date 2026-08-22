import { useEffect, useRef, useState } from 'react'
import { Panel } from '@components/ui/Panel'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { EmptyState } from '@components/ui/EmptyState'
import { MetricCard } from '../shared/MetricCard'
import { useCollege } from '../../hooks/useCollege'
import {
  buildJuniorSummerPrograms,
  buildSeniorScholarships,
} from '../../data/templates'
import {
  computeFinancialPlanningStats,
  formatCurrency,
  formatShortDate,
  scholarshipStatusLabel,
  generateId,
} from '../../utils'
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
  const stats = computeFinancialPlanningStats(
    userData?.financialAid ?? [],
    scholarships,
    colleges,
  )
  const seedingRef = useRef(false)
  const [name, setName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [amount, setAmount] = useState('')
  const [requirements, setRequirements] = useState('')
  const [collegeId, setCollegeId] = useState('')
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
        requirements: requirements
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        collegeId: collegeId || undefined,
      }
      await updateScholarships([...scholarships, next])
      setName('')
      setDeadline('')
      setAmount('')
      setRequirements('')
      setCollegeId('')
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
      {scholarships.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          <MetricCard
            label="Awarded"
            value={
              stats.scholarshipAwardedTotal > 0
                ? formatCurrency(stats.scholarshipAwardedTotal)
                : '—'
            }
            variant="success"
          />
          <MetricCard
            label="Pending"
            value={
              stats.scholarshipPendingTotal > 0
                ? formatCurrency(stats.scholarshipPendingTotal)
                : stats.scholarshipActiveCount
            }
            subValue={stats.scholarshipPendingTotal > 0 ? 'if all awarded' : 'active'}
            variant="accent"
          />
          <MetricCard
            label="Submitted"
            value={scholarships.filter((s) => s.status === 'submitted').length}
            subValue={`of ${scholarships.length}`}
            variant="default"
          />
        </div>
      )}

      <div className="mb-3 grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)]/40 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_1fr_auto]">
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
        <Input
          label="Requirements (comma-separated)"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Essay, transcript, …"
        />
        {colleges.length > 0 && (
          <label className="flex flex-col gap-1 text-xs text-[var(--color-text-tertiary)]">
            Linked school (optional)
            <select
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5 text-xs text-[var(--color-text-primary)]"
            >
              <option value="">None</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
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
              className="text-xs text-[var(--color-accent-muted)] hover:underline"
            >
              Load starter list
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-xs text-[var(--color-text-tertiary)]">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Deadline</th>
                <th className="pb-2 font-medium">{isSeniorMode ? 'Amount' : 'Cost'}</th>
                <th className="pb-2 font-medium">Requirements</th>
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
                        <span className="block text-xs text-[var(--color-text-tertiary)]">
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
                    <td className="max-w-[8rem] py-2 pr-2 text-xs text-[var(--color-text-tertiary)]">
                      {s.requirements.length > 0 ? s.requirements.join(' · ') : '—'}
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={s.status}
                        onChange={(e) =>
                          void updateStatus(s.id, e.target.value as ScholarshipStatus)
                        }
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-1.5 py-1 text-xs text-[var(--color-text-primary)]"
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
                        className="text-xs text-[var(--color-danger)] hover:underline"
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
