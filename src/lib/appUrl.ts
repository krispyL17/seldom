/**
 * Canonical app origin for auth emails and redirects.
 * Set VITE_APP_URL in Vercel (e.g. https://seldom-nine.vercel.app) so confirmation
 * emails never point at localhost when users sign up on production.
 */
export function getAppOrigin(): string {
  const configured = import.meta.env.VITE_APP_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'http://localhost:3000'
}

/** Where Supabase sends users after email confirmation. */
export function getEmailConfirmRedirectUrl(): string {
  return `${getAppOrigin()}/auth/callback`
}

/** Password reset landing page. */
export function getPasswordResetRedirectUrl(): string {
  return `${getAppOrigin()}/reset-password`
}
