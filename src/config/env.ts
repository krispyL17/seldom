/**
 * Environment configuration.
 * Centralizes access to Vite env vars with validation helpers.
 *
 * Vite exposes only variables prefixed with VITE_ to the browser.
 * All Supabase keys here are the public anon key — never put service-role keys here.
 */

/** Supabase project URL */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/** Supabase anonymous (public) API key — safe for browser use with RLS enabled */
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const PLACEHOLDER_MARKERS = ['your-project-id', 'your-anon-key-here']

function isValidEnvValue(value: string | undefined): value is string {
  if (!value || value.trim().length === 0) return false
  return !PLACEHOLDER_MARKERS.some((marker) => value.includes(marker))
}

/** Returns true when Supabase credentials are configured with real values */
export function isSupabaseConfigured(): boolean {
  return isValidEnvValue(SUPABASE_URL) && isValidEnvValue(SUPABASE_ANON_KEY)
}

/** Application metadata */
export const APP_CONFIG = {
  name: 'Seldom',
  tagline: 'Your personal control center',
  version: '0.1.0',
} as const
