import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Modal } from '@components/ui/Modal'
import { useCollege } from '../../hooks/useCollege'
import type { ApplicationStatus } from '../../types'

interface AddCollegeModalProps {
  open: boolean
  onClose: () => void
}

export function AddCollegeModal({ open, onClose }: AddCollegeModalProps) {
  const { createCollege, isSeniorMode, studentProfile } = useCollege()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [interest, setInterest] = useState<ApplicationStatus>(
    isSeniorMode ? 'planning' : 'researching',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Enter a school name.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await createCollege({
        name: trimmed,
        location: location.trim(),
        status: interest,
        majors: studentProfile?.intendedMajor ? [studentProfile.intendedMajor] : [],
      })
      setName('')
      setLocation('')
      setInterest(isSeniorMode ? 'planning' : 'researching')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add college')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isSeniorMode ? 'Add school to your list' : 'Add a school you are exploring'}
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <Input
          label="School name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Any school you are researching"
          autoFocus
        />
        <Input
          label="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, state or region"
        />
        <div className="space-y-1.5">
          <label htmlFor="college-interest" className="block text-xs font-medium text-[var(--color-text-secondary)]">
            Where is this school for you right now?
          </label>
          <select
            id="college-interest"
            value={interest}
            onChange={(e) => setInterest(e.target.value as ApplicationStatus)}
            className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 text-sm text-[var(--color-text-primary)]"
          >
            {isSeniorMode ? (
              <>
                <option value="planning">Planning to apply</option>
                <option value="researching">Still researching</option>
                <option value="applying">Applying now</option>
              </>
            ) : (
              <>
                <option value="researching">Just exploring</option>
                <option value="planning">On my short list</option>
              </>
            )}
          </select>
        </div>
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Adding…' : 'Add school'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
