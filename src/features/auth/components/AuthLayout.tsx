import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { APP_CONFIG } from '@config/env'
import { SeldomMark } from '@components/layout/SidebarBrand'

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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--color-accent-muted)_12%,transparent)_0%,_transparent_55%)]"
        aria-hidden
      />

      <main className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <SeldomMark className="text-2xl" />
            <span className="font-display text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              {APP_CONFIG.name}
            </span>
          </Link>
          <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">{APP_CONFIG.tagline}</p>
        </div>

        {children}
      </main>
    </div>
  )
}
