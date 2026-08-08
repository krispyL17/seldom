/**
 * Turn technical errors into short, plain-language messages for UI.
 */
export function formatUserError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback

  const msg = error.message.toLowerCase()

  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Could not reach the server. Check your internet connection and try again.'
  }
  if (msg.includes('503') || msg.includes('ollama') || msg.includes('unavailable')) {
    return 'AI is offline right now. The host may need to start Ollama or refresh the tunnel URL.'
  }
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('jwt')) {
    return 'Your session expired. Sign out and sign in again.'
  }
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'That took too long — the AI model may be busy or running on a slow connection.'
  }
  if (msg.includes('supabase is not configured')) {
    return 'Database is not configured. Add Supabase keys to your environment.'
  }
  if (msg.length > 120) {
    return fallback
  }

  return error.message
}
