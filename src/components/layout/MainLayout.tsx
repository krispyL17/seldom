import { useState } from 'react'

import { Outlet } from 'react-router-dom'

import { AppTutorialModal } from '@features/app-tutorial'

import { TabIntroGate } from '@features/tab-intro'

import { useUserPreferences } from '@features/preferences'

import { Sidebar } from './Sidebar'

import { TopBar } from './TopBar'

import { MobileDrawer } from './MobileDrawer'



/**

 * Main application shell with optional welcome tutorial overlay.

 */

export function MainLayout() {

  const [mobileOpen, setMobileOpen] = useState(false)

  const { tutorialOpen, closeTutorial } = useUserPreferences()



  return (

    <div className="flex min-h-dvh bg-[var(--color-surface-base)]">

      <Sidebar />

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />



      <div className="flex min-w-0 flex-1 flex-col">

        <TopBar onMenuOpen={() => setMobileOpen(true)} />



        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6">

          <Outlet />

        </main>

      </div>



      <TabIntroGate />



      <AppTutorialModal open={tutorialOpen} onClose={closeTutorial} />

    </div>

  )

}

