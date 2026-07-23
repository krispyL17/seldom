import { useEffect, useRef, type ReactNode } from 'react'
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

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Accessible modal overlay for forms and dialogs */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    const focusTarget =
      dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? dialogRef.current
    focusTarget?.focus()

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
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
