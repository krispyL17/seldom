import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@app/providers/AuthProvider'
import { AnalyticsProvider } from '@features/analytics'
import { CollegeProvider } from '@features/college/hooks/useCollege'
import { UserPreferencesProvider } from '@features/preferences'
import { NotificationProvider } from '@features/notifications'
import { AiSessionProviders } from '@features/ai-session'
import { AthleteDevelopmentProvider } from '@features/soccer/hooks/useAthleteDevelopment'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserPreferencesProvider>
          <NotificationProvider>
            <AnalyticsProvider>
              <CollegeProvider>
                <AthleteDevelopmentProvider>
                  <AiSessionProviders>{children}</AiSessionProviders>
                </AthleteDevelopmentProvider>
              </CollegeProvider>
            </AnalyticsProvider>
          </NotificationProvider>
        </UserPreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
