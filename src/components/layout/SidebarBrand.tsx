import { APP_CONFIG } from '@config/env'

interface SidebarBrandProps {
  /** Larger text for desktop sidebar; compact for mobile drawer */
  size?: 'default' | 'compact'
}

/**
 * Shared brand mark used in desktop sidebar and mobile drawer.
 */
export function SidebarBrand({ size = 'default' }: SidebarBrandProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)]/15">
        <span className="text-sm font-bold text-[var(--color-accent)]">S</span>
      </div>
      <span
        className={
          size === 'compact'
            ? 'text-lg font-semibold text-[var(--color-text-primary)]'
            : 'text-lg font-semibold tracking-tight text-[var(--color-text-primary)]'
        }
      >
        {APP_CONFIG.name}
      </span>
    </div>
  )
}

/** Version label for sidebar footer */
export function SidebarFooter() {
  return (
    <div className="border-t border-[var(--color-border)] p-4">
      <p className="text-xs text-[var(--color-text-tertiary)]">v{APP_CONFIG.version}</p>
    </div>
  )
}
