/**
 * Root application component.
 * Composes providers and the top-level router.
 */
import { AppProviders } from '@app/providers/AppProviders'
import { AppRouter } from '@app/router'

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
