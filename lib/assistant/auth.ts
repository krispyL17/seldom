import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { AssistantEnv } from './types.js'

export async function verifyAccessToken(
  env: AssistantEnv,
  accessToken: string,
): Promise<{ userId: string; client: SupabaseClient } | null> {
  const client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })

  const { data, error } = await client.auth.getUser(accessToken)
  if (error || !data.user) return null

  return { userId: data.user.id, client }
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7).trim() || null
}
