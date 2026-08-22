import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppTutorialModal } from '@features/app-tutorial'
import { TabIntroGate } from '@features/tab-intro'
import { AiFloatingPopup } from '@features/ai-session'
import { useUserPreferences } from '@features/preferences'
import { cn } from '@lib/utils'
import { useTabAccentScopeStyle } from '@hooks/useTabAccentScopeStyle'
import { SidebarFooter } from './SidebarBrand'
import { SidebarNav } from './SidebarNav'
import { TopBar } from './TopBar'
import { MobileDrawer } from './MobileDrawer'

/**
 * Main application shell with optional welcome tutorial overlay.
 */
export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const { tutorialOpen, closeTutorial } = useUserPreferences()
  const location = useLocation()
  const fitViewportTabs =
    location.pathname === '/' ||
    location.pathname.startsWith('/soccer') ||
    location.pathname.startsWith('/college')
  const tabAccentStyle = useTabAccentScopeStyle()

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-surface-base)]">
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {navOpen && (
        <aside className="app-shell-sidebar hidden w-60 shrink-0 flex-col border-r border-[var(--color-border)] md:flex">
          <SidebarNav />
          <SidebarFooter />
        </aside>
      )}

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar
          onMenuOpen={() => setMobileOpen(true)}
          navOpen={navOpen}
          onNavToggle={() => setNavOpen((open) => !open)}
        />

        <main
          id="main-content"
          className={cn(
            'min-h-0 flex-1 p-2 md:p-3',
            fitViewportTabs ? 'flex flex-col overflow-hidden' : 'overflow-y-auto',
          )}
        >
          <div
            className={cn(fitViewportTabs && 'flex h-0 min-h-0 flex-1 flex-col')}
            style={tabAccentStyle}
          >
            <Outlet />
          </div>
        </main>
      </div>

      <TabIntroGate />
      <AiFloatingPopup />
      <AppTutorialModal open={tutorialOpen} onClose={closeTutorial} />
    </div>
  )
}
