import { Link } from 'react-router-dom'
import { cn } from '@lib/utils'
import type { AppNotification } from '../types'

interface NotificationToastStackProps {
  toasts: AppNotification[]
  onDismiss: (id: string) => void
}

export function NotificationToastStack({ toasts, onDismiss }: NotificationToastStackProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-full max-w-sm flex-col gap-2 p-4 sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto animate-slide-up rounded-[var(--radius-lg)] border border-[var(--color-border)]',
            'bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-elevated)]',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{toast.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {toast.body}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            >
              ×
            </button>
          </div>
          {toast.href && (
            <Link
              to={toast.href}
              onClick={() => onDismiss(toast.id)}
              className="mt-3 inline-block text-xs font-medium text-[var(--color-accent-muted)] hover:underline"
            >
              View
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
