import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileDrawer } from './MobileDrawer'

/**
 * Main application shell.
 *
 * Layout:
 *   ┌──────────┬─────────────────────────────┐
 *   │ Sidebar  │  TopBar (search · bell · 👤) │
 *   │  (nav)   ├─────────────────────────────┤
 *   │          │  <Outlet /> — page content   │
 *   └──────────┴─────────────────────────────┘
 *
 * Responsive:
 *   md+  → fixed left sidebar
 *   <md  → hamburger opens slide-over drawer
 */
export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-[var(--color-surface-base)]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile drawer overlay */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuOpen={() => setMobileOpen(true)} />

        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
