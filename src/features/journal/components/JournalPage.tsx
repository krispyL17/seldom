import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { IconPlus } from '@components/ui/icons'
import { JournalEntryCard } from './JournalEntryCard'
import { JournalEntryForm } from './JournalEntryForm'
import { useJournal } from '../hooks/useJournal'
import type { JournalEntry } from '../types'

export function JournalPage() {
  const { entries, loading, error, createEntry, updateEntry, deleteEntry, reload } =
    useJournal()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  function openCreate() {
    setEditingEntry(null)
    setModalOpen(true)
  }

  function openEdit(entry: JournalEntry) {
    setEditingEntry(entry)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingEntry(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this journal entry?')) return
    try {
      await deleteEntry(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete entry')
    }
  }

  async function handleFormSubmit(input: Parameters<typeof createEntry>[0]) {
    if (editingEntry) {
      await updateEntry(editingEntry.id, input)
    } else {
      await createEntry(input)
    }
    closeModal()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Journal
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Daily reflections — mood, energy, wins, and tomorrow's focus
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <IconPlus width={16} height={16} />
          New entry
        </Button>
      </header>

      {loading && (
        <p className="py-12 text-center text-sm text-[var(--color-text-tertiary)]">
          Loading entries…
        </p>
      )}

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
            Run the SQL migration in Supabase Dashboard → SQL Editor (
            <code>supabase/migrations/003_journal_entries.sql</code>).
          </p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={reload}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            No journal entries yet. Capture how today went.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            Write first entry
          </Button>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <ol className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id}>
              <JournalEntryCard
                entry={entry}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ol>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingEntry ? 'Edit entry' : 'New journal entry'}
      >
        <JournalEntryForm
          key={editingEntry?.id ?? 'new'}
          entry={editingEntry}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}
