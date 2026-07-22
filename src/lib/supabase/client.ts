import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@config/env'
import type { Database } from '@/types/database'

/** Typed Supabase client for the Seldom app */
export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Supabase client singleton.
 *
 * Configured for browser auth (persisted sessions, auto-refresh).
 * Returns null when credentials are missing so the UI can run without Supabase.
 */
let supabaseInstance: TypedSupabaseClient | null = null

export function getSupabaseClient(): TypedSupabaseClient | null {
  if (!isSupabaseConfigured()) {
    if (import.meta.env.DEV) {
      console.warn(
        '[Seldom] Supabase not configured. Copy .env.example → .env.local and add your credentials.',
      )
    }
    return null
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      SUPABASE_URL as string,
      SUPABASE_ANON_KEY as string,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    )
  }

  return supabaseInstance
}

/** Returns true when a live Supabase client is available */
export function hasSupabaseClient(): boolean {
  return getSupabaseClient() !== null
}

export type { SupabaseClient }
