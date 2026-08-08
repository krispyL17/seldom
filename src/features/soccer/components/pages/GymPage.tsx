import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { IconPlus } from '@components/ui/icons'
import { Panel } from '@components/ui/Panel'
import { MiniBarChart } from '@components/ui/MiniBarChart'
import { GymLogForm } from '../../gym/components/GymLogForm'
import { useGymLogs } from '../../gym/hooks/useGymLogs'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import { formatShortDate } from '../../utils'
import { formatMinutesDuration } from '@lib/formatDuration'

function weeklyGymMinutes(logs: { session_date: string; duration_min: number }[]) {
  const buckets = new Map<string, number>()
  for (const log of logs) {
    const date = new Date(`${log.session_date}T12:00:00`)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    buckets.set(key, (buckets.get(key) ?? 0) + log.duration_min)
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([week, minutes]) => ({
      label: new Date(`${week}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes,
    }))
}

export function GymPage() {
  const { development } = useAthleteDevelopment()
  const { logs, loading, createLog, deleteLog } = useGymLogs()
  const [modalOpen, setModalOpen] = useState(false)

  const weekly = useMemo(() => weeklyGymMinutes(logs), [logs])
  const totalMinutes = useMemo(() => logs.reduce((sum, log) => sum + log.duration_min, 0), [logs])

  if (!development.gymEnabled) {
    return <Navigate to="/soccer/overview" replace />
  }

  async function handleSubmit(input: Parameters<typeof createLog>[0]) {
    await createLog(input)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this workout?')) return
    await deleteLog(id)
  }

  if (loading) {
    return <p className="py-3 text-center text-xs text-[var(--color-text-tertiary)]">Loading…</p>
  }

  return (
    <div className="perf-page-fit flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] text-[var(--color-text-tertiary)]">
          {logs.length} workout{logs.length === 1 ? '' : 's'} · {formatMinutesDuration(totalMinutes)} total
        </p>
        <Button onClick={() => setModalOpen(true)} size="sm" className="gap-1.5">
          <IconPlus width={16} height={16} />
          Log workout
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-2">
        <Panel fillHeight title="Weekly volume" subtitle="Last 6 weeks" className="min-h-0">
          {weekly.length === 0 ? (
            <p className="text-[11px] text-[var(--color-text-tertiary)]">Log a workout to see trends.</p>
          ) : (
            <>
              <MiniBarChart
                data={weekly.map((w) => w.minutes)}
                labels={weekly.map((w) => w.label)}
                height={48}
                maxBars={6}
                color="var(--color-accent-muted)"
                formatValue={formatMinutesDuration}
                showAxis
                showValues
              />
              <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">
                Avg {Math.round(totalMinutes / Math.max(logs.length, 1))} min per session
              </p>
            </>
          )}
        </Panel>

        <Panel fillHeight title="Recent workouts" subtitle={`${logs.length} logged`} className="min-h-0">
          {logs.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-[var(--color-text-secondary)]">No gym sessions yet.</p>
              <Button className="mt-3" size="sm" onClick={() => setModalOpen(true)}>
                Log your first workout
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-start justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                      {formatMinutesDuration(log.duration_min)}
                      {log.workout_type && (
                        <span className="ml-2 text-xs font-medium text-[var(--color-text-secondary)]">
                          · {log.workout_type}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">
                      {formatShortDate(log.session_date)}
                    </p>
                    {log.notes && (
                      <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">{log.notes}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0" onClick={() => void handleDelete(log.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log workout">
        <GymLogForm onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
