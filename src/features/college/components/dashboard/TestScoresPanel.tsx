import { useEffect, useState } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Panel } from '@components/ui/Panel'
import { Badge } from '@components/ui/Badge'
import { useCollege } from '../../hooks/useCollege'
import { DEFAULT_TEST_SCORES, type TestScores, type TestStatus } from '../../types'

const TEST_STATUSES: { value: TestStatus; label: string }[] = [
  { value: 'not_taken', label: 'Not taken' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'sent', label: 'Sent to colleges' },
]

function ScoreFields({
  label,
  entry,
  onChange,
}: {
  label: string
  entry: TestScores['sat']
  onChange: (next: TestScores['sat']) => void
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)]/50 p-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
        {label}
      </p>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input
          label="Score"
          type="number"
          value={entry.score ?? ''}
          onChange={(e) => {
            const raw = e.target.value
            onChange({
              ...entry,
              score: raw === '' ? null : Number(raw),
            })
          }}
          placeholder={label === 'SAT' ? '400–1600' : '1–36'}
        />
        <label className="block text-[10px] font-medium text-[var(--color-text-tertiary)]">
          Status
          <select
            value={entry.status}
            onChange={(e) =>
              onChange({ ...entry, status: e.target.value as TestStatus })
            }
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5 text-xs text-[var(--color-text-primary)]"
          >
            {TEST_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {entry.date && (
        <p className="mt-2 text-[10px] text-[var(--color-text-tertiary)]">Last updated {entry.date}</p>
      )}
    </div>
  )
}

export function TestScoresPanel() {
  const { userData, updateTestScores } = useCollege()
  const [scores, setScores] = useState<TestScores>(DEFAULT_TEST_SCORES)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (userData?.testScores) {
      setScores(userData.testScores)
    }
  }, [userData?.testScores])

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const next: TestScores = {
        sat: {
          ...scores.sat,
          date:
            scores.sat.status === 'completed' || scores.sat.status === 'sent'
              ? scores.sat.date ?? today
              : scores.sat.date,
        },
        act: {
          ...scores.act,
          date:
            scores.act.status === 'completed' || scores.act.status === 'sent'
              ? scores.act.date ?? today
              : scores.act.date,
        },
      }
      await updateTestScores(next)
      setScores(next)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel fillHeight title="Test scores" subtitle="SAT & ACT — saved to your plan">
      <div className="space-y-3">
        <ScoreFields
          label="SAT"
          entry={scores.sat}
          onChange={(sat) => setScores((prev) => ({ ...prev, sat }))}
        />
        <ScoreFields
          label="ACT"
          entry={scores.act}
          onChange={(act) => setScores((prev) => ({ ...prev, act }))}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <Badge variant="muted">Updates financial aid & application timelines</Badge>
          <div className="flex items-center gap-2">
            {saved && <span className="text-[10px] text-[var(--color-success)]">Saved</span>}
            <Button type="button" size="sm" disabled={saving} onClick={() => void save()}>
              {saving ? 'Saving…' : 'Save scores'}
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  )
}
