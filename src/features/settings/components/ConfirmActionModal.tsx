import { useId, type ReactNode } from 'react'
import { Button } from '@components/ui/Button'
import { Modal, ModalFooter } from '@components/ui/Modal'

interface ConfirmActionModalProps {
  open: boolean
  onClose: () => void
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
  destructive?: boolean
}

/** In-app confirmation for destructive or irreversible settings actions. */
export function ConfirmActionModal({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  loading = false,
  destructive = false,
}: ConfirmActionModalProps) {
  const descriptionId = useId()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      describedBy={descriptionId}
      preventClose={loading}
      size="sm"
    >
      <div id={descriptionId} className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {description}
      </div>
      <ModalFooter>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          size="sm"
          variant={destructive ? 'secondary' : 'primary'}
          className={destructive ? 'border-[var(--color-danger)] text-[var(--color-danger)]' : undefined}
          onClick={() => void onConfirm()}
          disabled={loading}
        >
          {loading ? 'Working…' : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
