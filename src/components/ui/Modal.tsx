import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from '@components/ui/IconButton'
import { IconClose } from '@components/ui/icons'
import { cn } from '@lib/utils'

const SIZE_CLASS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
} as const

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  describedBy?: string
  children: ReactNode
  className?: string
  size?: keyof typeof SIZE_CLASS
  /** Block escape, backdrop click, and close button */
  preventClose?: boolean
  /** Extra control in the header (e.g. Skip) */
  headerAction?: ReactNode
  hideCloseButton?: boolean
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Accessible modal overlay — portaled above app chrome (top bar, nav). */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  describedBy,
  children,
  className,
  size = 'md',
  preventClose = false,
  headerAction,
  hideCloseButton = false,
}: ModalProps) {
  const titleId = useId()
  const subtitleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!preventClose) onClose()
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
      previouslyFocusedRef.current?.focus()
    }
  }, [open, onClose, preventClose])

  if (!open) return null

  const handleBackdropClose = () => {
    if (!preventClose) onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-backdrop-in bg-[var(--color-scrim)] backdrop-blur-sm"
        onClick={handleBackdropClose}
        aria-hidden
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy ?? (subtitle ? subtitleId : undefined)}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[min(90dvh,calc(100dvh-5rem))] w-full flex-col overflow-hidden',
          'animate-scale-in rounded-t-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
          'shadow-[var(--shadow-elevated)] sm:rounded-[var(--radius-xl)]',
          SIZE_CLASS[size],
          className,
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-display text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
              {title}
            </h2>
            {subtitle && (
              <p id={subtitleId} className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerAction}
            {!hideCloseButton && (
              <IconButton label="Close dialog" onClick={onClose} disabled={preventClose}>
                <IconClose />
              </IconButton>
            )}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

/** Standard action row for modal footers */
export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] pt-4',
        className,
      )}
    >
      {children}
    </div>
  )
}
