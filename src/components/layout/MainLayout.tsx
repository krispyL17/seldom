import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppTutorialModal } from '@features/app-tutorial'
import { TabIntroGate } from '@features/tab-intro'
import { AiFloatingPopup } from '@features/ai-session'
import { useUserPreferences } from '@features/preferences'
import { cn } from '@lib/utils'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileDrawer } from './MobileDrawer'

/**
 * Main application shell with optional welcome tutorial overlay.
 */
export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { tutorialOpen, closeTutorial } = useUserPreferences()
  const location = useLocation()
  const fitViewportTabs =
    location.pathname === '/' ||
    (location.pathname.startsWith('/soccer') &&
      !location.pathname.startsWith('/soccer/preferences')) ||
    location.pathname.startsWith('/college')

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-surface-base)]">
      <Sidebar />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar onMenuOpen={() => setMobileOpen(true)} />

        <main
          id="main-content"
          className={cn(
            'min-h-0 flex-1 p-3 md:p-4',
            fitViewportTabs ? 'overflow-hidden' : 'overflow-y-auto',
          )}
        >
          <Outlet />
        </main>
      </div>

      <TabIntroGate />
      <AiFloatingPopup />
      <AppTutorialModal open={tutorialOpen} onClose={closeTutorial} />
    </div>
  )
}
