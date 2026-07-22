import type { ReactNode } from 'react'

interface PlaceholderPageProps {
  title: string
  description: string
  children?: ReactNode
}

/**
 * Reusable shell for feature pages not yet built out.
 * Keeps each route visually distinct while content is in progress.
 */
export function PlaceholderPage({ title, description, children }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h2>
        <p className="mt-1 text-[var(--color-text-secondary)]">{description}</p>
      </header>

      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]/50 p-8 text-center">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          UI coming soon — this page is wired up and ready for content.
        </p>
        {children}
      </div>
    </div>
  )
}
