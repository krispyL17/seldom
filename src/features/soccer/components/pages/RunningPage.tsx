import { useMemo, useState } from 'react'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { IconPlus } from '@components/ui/icons'
import { Panel } from '@components/ui/Panel'
import { RunLogCard } from '../../running/components/RunLogCard'
import { RunLogForm } from '../../running/components/RunLogForm'
import { RunGoalCard } from '../../running/components/RunGoalCard'
import { RunGoalForm } from '../../running/components/RunGoalForm'
import { RunningCharts } from '../../running/components/RunningCharts'
import { TrainingPlanPanel } from '../../running/components/TrainingPlanPanel'
import { useDistanceUnit } from '@hooks/useDistanceUnit'
import { useRunGoals } from '../../running/hooks/useRunGoals'
import { useRunLogs } from '../../running/hooks/useRunLogs'
import { useTrainingSessions } from '../../training/hooks/useTrainingSessions'
import type { RunLog, RunGoal } from '../../running/types'
import type { CreateRunLogInput, CreateRunGoalInput } from '../../running/types'
import { bestRunForDistance } from '../../running/utils'

export function RunningPage() {
  const { unit, setUnit, longLabel } = useDistanceUnit()
  const { runs, loading, error, createRun, updateRun, deleteRun, reload } = useRunLogs()
  const {
    goals,
    loading: goalsLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    reload: reloadGoals,
  } = useRunGoals()
  const { sessions } = useTrainingSessions()

  const [runModalOpen, setRunModalOpen] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [editingRun, setEditingRun] = useState<RunLog | null>(null)
  const [editingGoal, setEditingGoal] = useState<RunGoal | null>(null)

  const prIds = useMemo(() => {
    const ids = new Set<string>()
    const byDistance = new Map<number, RunLog>()
    for (const run of runs) {
      const key = Math.round(run.distance_m)
      const existing = byDistance.get(key)
      if (!existing || run.duration_sec < existing.duration_sec) {
        byDistance.set(key, run)
      }
    }
    for (const run of byDistance.values()) ids.add(run.id)
    return ids
  }, [runs])

  const avgIntensity = useMemo(() => {
    if (sessions.length === 0) return 0
    return Math.round(sessions.reduce((s, x) => s + x.intensity, 0) / sessions.length)
  }, [sessions])

  function openCreateRun() {
    setEditingRun(null)
    setRunModalOpen(true)
  }

  function openEditRun(run: RunLog) {
    setEditingRun(run)
    setRunModalOpen(true)
  }

  function openCreateGoal() {
    setEditingGoal(null)
    setGoalModalOpen(true)
  }

  function openEditGoal(goal: RunGoal) {
    setEditingGoal(goal)
    setGoalModalOpen(true)
  }

  async function handleRunSubmit(input: CreateRunLogInput) {
    if (editingRun) {
      await updateRun(editingRun.id, input)
    } else {
      await createRun(input)
    }
    setRunModalOpen(false)
    setEditingRun(null)

    const best = bestRunForDistance(
      editingRun
        ? runs.map((r) => (r.id === editingRun.id ? { ...r, ...input, distance_m: input.distance_m } as RunLog : r))
        : runs,
      input.distance_m,
    )
    if (best && best.duration_sec <= input.duration_sec) {
      const matchingGoal = goals.find(
        (g) =>
          Math.abs(g.distance_m - input.distance_m) / input.distance_m < 0.02 &&
          !g.achieved_at &&
          input.duration_sec <= g.target_duration_sec,
      )
      if (matchingGoal) {
        await updateGoal(matchingGoal.id, { achieved_at: new Date().toISOString() })
      }
    }
  }

  async function handleGoalSubmit(input: CreateRunGoalInput) {
    if (editingGoal) {
      await updateGoal(editingGoal.id, input)
    } else {
      await createGoal(input)
    }
    setGoalModalOpen(false)
    setEditingGoal(null)
  }

  async function handleDeleteRun(id: string) {
    if (!confirm('Delete this run?')) return
    try {
      await deleteRun(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  async function handleDeleteGoal(id: string) {
    if (!confirm('Delete this goal?')) return
    try {
      await deleteGoal(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  async function handleMarkAchieved(goal: RunGoal) {
    await updateGoal(goal.id, { achieved_at: new Date().toISOString() })
  }

  const isLoading = loading || goalsLoading

  return (
    <div className="perf-page-fit flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--color-text-tertiary)]">Distance:</span>
          {(['mi', 'km'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => void setUnit(u)}
              className={`rounded-[var(--radius-sm)] border px-2 py-0.5 text-[10px] uppercase ${
                unit === u
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              {u}
            </button>
          ))}
          <span className="text-[10px] text-[var(--color-text-tertiary)]">({longLabel})</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateGoal} variant="secondary" size="sm">
            Set goal
          </Button>
          <Button onClick={openCreateRun} size="sm" className="gap-1.5">
            <IconPlus width={16} height={16} />
            Log run
          </Button>
        </div>
      </div>

      {isLoading && (
        <p className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">Loading…</p>
      )}

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
            Could not load runs. Check your connection or database sync, then retry.
          </p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => { reload(); reloadGoals() }}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-2">
          <Panel fillHeight title="Cardio overview" subtitle="PRs, plans, and goals" className="min-h-0">
            <div className="space-y-3">
              <RunningCharts runs={runs} />

              <TrainingPlanPanel
                runs={runs}
                sessionCount={sessions.length}
                avgIntensity={avgIntensity}
              />

              {goals.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Pace goals · {goals.length} active
                  </p>
                  <ul className="space-y-3">
                    {goals.map((goal) => (
                      <li key={goal.id}>
                        <RunGoalCard
                          goal={goal}
                          runs={runs}
                          onEdit={openEditGoal}
                          onDelete={handleDeleteGoal}
                          onMarkAchieved={handleMarkAchieved}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Panel>

          <Panel fillHeight title="Run log" subtitle={`${runs.length} logged`} className="min-h-0">
            {runs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">No runs logged yet.</p>
                <Button className="mt-4" onClick={openCreateRun}>Log your first mile</Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {runs.map((run) => (
                  <li key={run.id}>
                    <RunLogCard
                      run={run}
                      isPr={prIds.has(run.id)}
                      onEdit={openEditRun}
                      onDelete={handleDeleteRun}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      <Modal
        open={runModalOpen}
        onClose={() => { setRunModalOpen(false); setEditingRun(null) }}
        title={editingRun ? 'Edit run' : 'Log run'}
      >
        <RunLogForm
          key={editingRun?.id ?? 'new-run'}
          run={editingRun}
          onSubmit={handleRunSubmit}
          onCancel={() => { setRunModalOpen(false); setEditingRun(null) }}
        />
      </Modal>

      <Modal
        open={goalModalOpen}
        onClose={() => { setGoalModalOpen(false); setEditingGoal(null) }}
        title={editingGoal ? 'Edit pace goal' : 'Set pace goal'}
      >
        <RunGoalForm
          key={editingGoal?.id ?? 'new-goal'}
          goal={editingGoal}
          onSubmit={handleGoalSubmit}
          onCancel={() => { setGoalModalOpen(false); setEditingGoal(null) }}
        />
      </Modal>
    </div>
  )
}
