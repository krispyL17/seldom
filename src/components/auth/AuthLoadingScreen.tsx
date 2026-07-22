/**
 * Full-screen loading state while auth session is restored.
 */
export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-surface-base)]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-bg)]">
          <span className="text-lg font-bold text-[var(--color-brand)]">S</span>
        </div>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-[var(--color-surface-elevated)]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--color-brand)]" />
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">Restoring session…</p>
      </div>
    </div>
  )
}
