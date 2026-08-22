/**
 * Turn technical errors into short, plain-language messages for UI.
 * Each helper answers: what failed, why (when known), and how to recover.
 */

export function formatUserError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback

  const msg = error.message.toLowerCase()

  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('networkerror')) {
    return 'Could not reach the server. Check your internet connection and try again.'
  }
  if (msg.includes('503') || msg.includes('ollama') || msg.includes('unavailable')) {
    return 'AI is offline right now. Try again later, or check AI status in Settings if you host Seldom.'
  }
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('jwt') || msg.includes('session')) {
    return 'Your session expired. Sign out, sign back in, and try again.'
  }
  if (msg.includes('403') || msg.includes('permission') || msg.includes('row-level security')) {
    return 'You do not have access to that data. Sign out and back in, then try again.'
  }
  if (msg.includes('404') || msg.includes('not found')) {
    return fallback
  }
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'That took too long. Wait a moment and try again.'
  }
  if (msg.includes('duplicate') || msg.includes('already exists') || msg.includes('unique constraint')) {
    return 'That already exists. Change the name or edit the existing item.'
  }
  if (msg.includes('supabase is not configured') || msg.includes('not configured')) {
    return 'This copy of Seldom is not connected to a database yet.'
  }
  if (msg.includes('invalid json') || msg.includes('unexpected token') || msg.includes('parse')) {
    return 'That file does not look like a valid backup. Choose a Seldom export file and try again.'
  }
  if (msg.startsWith('failed to export') || msg.startsWith('failed to import') || msg.startsWith('failed to reset')) {
    return fallback
  }
  if (msg.length > 120) {
    return fallback
  }

  return error.message
}

export function loadError(resource: string, error: unknown): string {
  return formatUserError(
    error,
    `Could not load ${resource}. Check your connection and try again.`,
  )
}

export function saveError(resource: string, error: unknown): string {
  return formatUserError(
    error,
    `Could not save ${resource}. Your changes are still here — try again.`,
  )
}

export function deleteError(resource: string, error: unknown): string {
  return formatUserError(error, `Could not delete ${resource}. Try again in a moment.`)
}

export function updateError(resource: string, error: unknown): string {
  return formatUserError(error, `Could not update ${resource}. Try again.`)
}

export function boundaryErrorMessage(error: Error | null, fallback: string): string {
  if (!error) return fallback
  return formatUserError(error, fallback)
}
