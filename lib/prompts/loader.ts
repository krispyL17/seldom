/**
 * External prompt configuration loader.
 * Prompts live in config/prompts/*.json — not hardcoded in application code.
 * Optional DB override via ai_prompts table; optional env JSON via SOCCER_COACH_PROMPT_JSON.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface PromptModeConfig {
  instruction: string
}

export interface PromptSearchConfig {
  enabled: boolean
  queryTemplates: string[]
  trustedDomains: string[]
}

export interface PromptConfig {
  id: string
  version: number
  welcome?: string
  system: string
  modes: Record<string, PromptModeConfig>
  suggestions: string[]
  search?: PromptSearchConfig
}

const promptCache = new Map<string, PromptConfig>()

function resolvePromptPath(promptId: string): string {
  const envPath = process.env[`${promptId.toUpperCase().replace(/-/g, '_')}_PROMPT_PATH`]
  if (envPath) return envPath

  const moduleDir = dirname(fileURLToPath(import.meta.url))
  return join(moduleDir, '../../config/prompts', `${promptId}.json`)
}

function parsePromptJson(raw: string, source: string): PromptConfig {
  const parsed = JSON.parse(raw) as PromptConfig
  if (!parsed.id || !parsed.system || !parsed.modes) {
    throw new Error(`Invalid prompt config from ${source}: missing id, system, or modes`)
  }
  return parsed
}

export async function loadPromptConfig(
  promptId: string,
  client?: SupabaseClient,
): Promise<PromptConfig> {
  const cached = promptCache.get(promptId)
  if (cached) return cached

  const envJson = process.env[`${promptId.toUpperCase().replace(/-/g, '_')}_PROMPT_JSON`]
  if (envJson) {
    const config = parsePromptJson(envJson, 'environment variable')
    promptCache.set(promptId, config)
    return config
  }

  if (client) {
    const { data, error } = await client
      .from('ai_prompts')
      .select('content')
      .eq('id', promptId)
      .eq('active', true)
      .maybeSingle()

    if (!error && data?.content) {
      const config = data.content as PromptConfig
      if (config.system && config.modes) {
        promptCache.set(promptId, config)
        return config
      }
    }
  }

  const filePath = resolvePromptPath(promptId)
  const raw = readFileSync(filePath, 'utf8')
  const config = parsePromptJson(raw, filePath)
  promptCache.set(promptId, config)
  return config
}

export function clearPromptCache(): void {
  promptCache.clear()
}
