import { useEffect, useId, useRef } from 'react'
import { IconButton } from '@components/ui/IconButton'
import { IconClose } from '@components/ui/icons'
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

  useEffect(() => {
    if (!open) return

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
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        onClick={onClose}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--color-border)]',
          'bg-[var(--color-surface-raised)] md:hidden',
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div id={titleId}>
            <SidebarBrand size="compact" />
          </div>
          <IconButton ref={closeButtonRef} label="Close menu" onClick={onClose}>
            <IconClose />
          </IconButton>
        </div>

        <SidebarNav onNavigate={onClose} />

        <SidebarFooter />
      </aside>
    </>
  )
}
