import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { APP_CONFIG } from '@config/env'

interface AuthLayoutProps {
  children: ReactNode
}

/**
 * Centered layout shell for login, sign-up, and password pages.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-[var(--color-surface-base)] px-4 py-12">
      {/* Subtle background gradient */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(10,132,255,0.08)_0%,_transparent_50%)]"
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)]/15">
              <span className="text-base font-bold text-[var(--color-accent)]">S</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              {APP_CONFIG.name}
            </span>
          </Link>
          <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">{APP_CONFIG.tagline}</p>
        </div>

        {children}
      </div>
    </div>
  )
}
