import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Modal } from '@components/ui/Modal'
import type { GymLog } from '@analytics/types'
import { formatMinutesDuration } from '@lib/formatDuration'
import {
  deleteLocalGymLog,
  fetchLocalGymLogs,
  updateLocalGymLog,
} from '@services/analytics/gymLogsLocal'

interface AnalyticsEditModalProps {
  open: boolean
  userId: string
  onClose: () => void
  onChanged: () => void
}

const SOURCE_LINKS = [
  { label: 'Tasks', href: '/tasks', hint: 'Completion rates' },
  { label: 'Goals', href: '/goals', hint: 'Progress tracking' },
  { label: 'Performance', href: '/soccer/overview', hint: 'Sessions & runs' },
  { label: 'Journal', href: '/journal', hint: 'Consistency streaks' },
  { label: 'Junior Prep', href: '/college', hint: 'Application progress' },
] as const

export function AnalyticsEditModal({ open, userId, onClose, onChanged }: AnalyticsEditModalProps) {
  const [logs, setLogs] = useState<GymLog[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sessionDate, setSessionDate] = useState('')
  const [duration, setDuration] = useState('45')
  const [workoutType, setWorkoutType] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reloadLogs = useCallback(() => {
    setLogs(fetchLocalGymLogs(userId))
  }, [userId])

  useEffect(() => {
    if (open) reloadLogs()
  }, [open, reloadLogs])

  function startEdit(log: GymLog) {
    setEditingId(log.id)
    setSessionDate(log.session_date)
    setDuration(String(log.duration_min))
    setWorkoutType(log.workout_type ?? '')
    setNotes(log.notes ?? '')
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setError(null)
  }

  function saveEdit() {
    if (!editingId) return
    const durationMin = Number(duration)
    if (!Number.isFinite(durationMin) || durationMin <= 0) {
      setError('Enter a valid duration in minutes.')
      return
    }

    updateLocalGymLog(editingId, {
      session_date: sessionDate,
      duration_min: durationMin,
      workout_type: workoutType.trim() || null,
      notes: notes.trim() || null,
    })
    cancelEdit()
    reloadLogs()
    onChanged()
  }

  function removeLog(id: string) {
    if (!confirm('Delete this gym session?')) return
    deleteLocalGymLog(id)
    if (editingId === id) cancelEdit()
    reloadLogs()
    onChanged()
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit mission telemetry">
      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        Gym sessions can be edited here. Other charts sync automatically from your workspace — open a
        source below to update tasks, goals, training, and journal data.
      </p>

      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Gym sessions
        </p>
        {logs.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
            No gym logs yet. Use <strong>Log session</strong> on the Gym chart to add one.
          </p>
        ) : (
          <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1">
            {logs.map((log) => (
              <li
                key={log.id}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-2"
              >
                {editingId === log.id ? (
                  <div className="space-y-2">
                    <Input label="Date" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
                    <Input
                      label="Minutes"
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                    <Input
                      label="Workout"
                      value={workoutType}
                      onChange={(e) => setWorkoutType(e.target.value)}
                    />
                    <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 text-xs text-[var(--color-text-secondary)]">
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {formatMinutesDuration(log.duration_min)}
                        {log.workout_type ? ` · ${log.workout_type}` : ''}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">{log.session_date}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(log)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeLog(log.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 border-t border-[var(--color-border)] pt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Data sources
        </p>
        <ul className="mt-2 space-y-1.5">
          {SOURCE_LINKS.map((source) => (
            <li key={source.href}>
              <Link
                to={source.href}
                onClick={onClose}
                className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs text-[var(--color-accent-muted)] hover:bg-[var(--color-surface-overlay)] hover:underline"
              >
                <span>{source.label}</span>
                <span className="text-[10px] text-[var(--color-text-tertiary)]">{source.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
