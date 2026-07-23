import { getSupabaseClient } from '@lib/supabase'
import type { SignInCredentials, SignUpCredentials, SignUpResult } from '@/types/auth'

/** Error thrown when Supabase is not configured or the client is unavailable */
export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Supabase is not configured. Add credentials to .env.local')
    this.name = 'SupabaseNotConfiguredError'
  }
}

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new SupabaseNotConfiguredError()
  return client
}

/** Redirect URL for password recovery emails */
function getPasswordResetRedirectUrl(): string {
  return `${window.location.origin}/reset-password`
}

/**
 * Authentication service — the only layer that calls Supabase Auth directly.
 */
export const authService = {
  async getSession() {
    const client = getSupabaseClient()
    if (!client) return { session: null, user: null }

    const { data, error } = await client.auth.getSession()
    if (error) throw error

    return {
      session: data.session,
      user: data.session?.user ?? null,
    }
  },

  async signIn({ email, password }: SignInCredentials) {
    const client = requireClient()
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  async signUp({ email, password, displayName }: SignUpCredentials): Promise<SignUpResult> {
    const client = requireClient()
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: displayName ? { data: { display_name: displayName } } : undefined,
    })
    if (error) throw error

    return {
      needsEmailConfirmation: Boolean(data.user && !data.session),
    }
  },

  async signOut() {
    const client = requireClient()
    const { error } = await client.auth.signOut()
    if (error) throw error
  },

  async resetPassword(email: string) {
    const client = requireClient()
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetRedirectUrl(),
    })
    if (error) throw error
  },

  async updatePassword(newPassword: string) {
    const client = requireClient()
    const { error } = await client.auth.updateUser({ password: newPassword })
    if (error) throw error
  },

  async updateDisplayName(displayName: string) {
    const client = requireClient()
    const { error } = await client.auth.updateUser({
      data: { display_name: displayName.trim() },
    })
    if (error) throw error
  },

  onAuthStateChange(
    callback: Parameters<
      NonNullable<ReturnType<typeof getSupabaseClient>>['auth']['onAuthStateChange']
    >[0],
  ) {
    const client = getSupabaseClient()
    if (!client) return () => {}

    const { data } = client.auth.onAuthStateChange(callback)
    return () => data.subscription.unsubscribe()
  },
}
