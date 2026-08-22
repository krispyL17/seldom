/** Default max output tokens when OLLAMA_MAX_TOKENS is unset. */
export const DEFAULT_OLLAMA_MAX_TOKENS = 4096

/** Upper bound for mode-specific overrides. */
export const MAX_OLLAMA_MAX_TOKENS = 8192

export function resolveOllamaMaxTokens(override?: number): number {
  if (typeof override === 'number' && Number.isFinite(override) && override > 0) {
    return Math.min(Math.floor(override), MAX_OLLAMA_MAX_TOKENS)
  }

  const raw = process.env.OLLAMA_MAX_TOKENS?.trim()
  if (raw) {
    const parsed = Number.parseInt(raw, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(parsed, MAX_OLLAMA_MAX_TOKENS)
    }
  }

  return DEFAULT_OLLAMA_MAX_TOKENS
}

/** Per-mode output budget — never below the global default. */
export function resolveModeMaxTokens(mode: string, override?: number): number {
  const base = resolveOllamaMaxTokens(override)

  switch (mode) {
    case 'weekly_review':
    case 'goal_breakdown':
    case 'development':
      return Math.min(Math.max(base, 6144), MAX_OLLAMA_MAX_TOKENS)
    case 'chat':
      return base
    default:
      return Math.min(Math.max(base, 4096), MAX_OLLAMA_MAX_TOKENS)
  }
}

export function shouldDisableThinking(model: string): boolean {
  const env = process.env.OLLAMA_THINK?.trim().toLowerCase()
  if (env === 'true' || env === '1') return false
  if (env === 'false' || env === '0') return true
  // Thinking models burn num_predict on internal reasoning — disable for full replies.
  return /qwen3|deepseek-r1|:r1|thinking/i.test(model)
}

/** Remove reasoning traces from model output when they leak into content. */
export function stripThinkingFromContent(content: string): string {
  return content.replace(/^[\s\S]*?<\/think>\s*/i, '').trim()
}
