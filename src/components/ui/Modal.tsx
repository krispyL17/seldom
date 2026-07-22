import { useEffect, type ReactNode } from 'react'
import { IconButton } from '@components/ui/IconButton'
import { IconClose } from '@components/ui/icons'
import { cn } from '@lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

/** Accessible modal overlay for forms and dialogs */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative flex max-h-[90dvh] w-full flex-col overflow-hidden',
          'rounded-t-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
          'shadow-[var(--shadow-panel)] sm:max-w-lg sm:rounded-[var(--radius-xl)]',
          className,
        )}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <IconClose />
          </IconButton>
        </header>

        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
