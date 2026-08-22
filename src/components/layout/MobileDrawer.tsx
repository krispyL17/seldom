import { useEffect, useId, useRef } from 'react'
import { IconButton } from '@components/ui/IconButton'
import { IconClose } from '@components/ui/icons'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { SidebarNav } from './SidebarNav'
import { SidebarBrand, SidebarFooter } from './SidebarBrand'
import { cn } from '@lib/utils'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

/**
 * Slide-over navigation drawer for mobile viewports.
 * Includes backdrop dismiss, escape-key close, and focus management.
 */
export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLElement | null>(null)

  useFocusTrap(open, drawerRef)

  useEffect(() => {
    if (!open) return

    menuButtonRef.current = document.activeElement as HTMLElement | null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      menuButtonRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[var(--color-scrim)] md:hidden"
        onClick={onClose}
        aria-hidden
      />

      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'app-shell-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--color-border)]',
          'bg-[var(--color-surface-raised)] md:hidden',
        )}
      >
        <div className="flex min-h-[4.5rem] items-center justify-between border-b border-[var(--color-border)] px-4 py-4">
          <div id={titleId}>
            <SidebarBrand size="compact" />
          </div>
          <IconButton ref={closeButtonRef} label="Close menu" onClick={onClose} className="h-11 w-11">
            <IconClose />
          </IconButton>
        </div>

        <SidebarNav onNavigate={onClose} />

        <SidebarFooter />
      </aside>
    </>
  )
}

