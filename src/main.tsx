/**
 * Application entry point.
 * Mounts the React app with global styles applied.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@app/App'
import '@styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
