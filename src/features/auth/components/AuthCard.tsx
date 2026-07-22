import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

/** Card wrapper for auth form content */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-panel)] sm:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
        )}
      </header>

      {children}

      {footer && (
        <footer className="mt-6 border-t border-[var(--color-border)] pt-6 text-center text-sm text-[var(--color-text-secondary)]">
          {footer}
        </footer>
      )}
    </div>
  )
}
