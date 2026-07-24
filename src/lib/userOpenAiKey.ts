const STORAGE_KEY = 'seldom-user-openai-key'

/** Optional user-provided OpenAI key — stored locally only, never synced to Supabase. */
export function getUserOpenAiKey(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)?.trim()
    return value || null
  } catch {
    return null
  }
}

export function setUserOpenAiKey(key: string | null): void {
  try {
    if (key?.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim())
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function openAiKeyHeaders(): Record<string, string> {
  const key = getUserOpenAiKey()
  return key ? { 'X-User-OpenAI-Key': key } : {}
}
