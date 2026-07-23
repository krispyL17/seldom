import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@app/providers/AuthProvider'
import { AnalyticsProvider } from '@features/analytics'
import { UserPreferencesProvider } from '@features/preferences'
import { NotificationProvider } from '@features/notifications'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserPreferencesProvider>
          <NotificationProvider>
            <AnalyticsProvider>{children}</AnalyticsProvider>
          </NotificationProvider>
        </UserPreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
