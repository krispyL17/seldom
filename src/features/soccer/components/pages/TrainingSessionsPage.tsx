import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { IconPlus } from '@components/ui/icons'
import { Panel } from '@components/ui/Panel'
import { TrainingSessionCard } from '../../training/components/TrainingSessionCard'
import { TrainingSessionCharts } from '../../training/components/TrainingSessionCharts'
import { TrainingSessionForm } from '../../training/components/TrainingSessionForm'
import { useTrainingSessions } from '../../training/hooks/useTrainingSessions'
import type { TrainingSession } from '../../training/types'
import type { CreateTrainingSessionInput } from '../../training/types'

export function TrainingSessionsPage() {
  const {
    sessions,
    loading,
    error,
    createSession,
    updateSession,
    deleteSession,
    reload,
  } = useTrainingSessions()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null)

  function openCreate() {
    setEditingSession(null)
    setModalOpen(true)
  }

  function openEdit(session: TrainingSession) {
    setEditingSession(session)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingSession(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this training session?')) return
    try {
      await deleteSession(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete session')
    }
  }

  async function handleFormSubmit(input: CreateTrainingSessionInput) {
    if (editingSession) {
      await updateSession(editingSession.id, input)
    } else {
      await createSession(input)
    }
    closeModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Log practice sessions with optional skill ratings — track development over time
        </p>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <IconPlus width={16} height={16} />
          Log session
        </Button>
      </div>

      {loading && (
        <p className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">Loading sessions…</p>
      )}

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
            Run the SQL migration in Supabase Dashboard → SQL Editor (
            <code>supabase/migrations/004_training_sessions.sql</code> or{' '}
            <code>supabase/apply-all.sql</code>).
          </p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={reload}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          <TrainingSessionCharts sessions={sessions} />

          <Panel title="Session Log" subtitle={`${sessions.length} logged`} fullWidth>
            {sessions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">No training sessions yet.</p>
                <Button className="mt-4" onClick={openCreate}>Log first session</Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <TrainingSessionCard
                      session={session}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingSession ? 'Edit session' : 'Log training session'}
      >
        <TrainingSessionForm
          key={editingSession?.id ?? 'new'}
          session={editingSession}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}
