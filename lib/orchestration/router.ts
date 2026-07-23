import type { OSMode } from './types.js'
import { OS_MODULES, VALID_MODES } from './modules.js'

function normalize(text: string): string {
  return text.toLowerCase().trim()
}

export function resolveMode(message: string, explicitMode?: OSMode): OSMode {
  if (explicitMode && VALID_MODES.includes(explicitMode)) {
    return explicitMode
  }

  const lower = normalize(message)
  if (!lower) return 'chat'

  let bestMode: OSMode = 'chat'
  let bestScore = 0

  for (const mod of OS_MODULES) {
    let score = 0
    for (const keyword of mod.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        score += keyword.split(' ').length >= 2 ? 3 : 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMode = mod.mode
    }
  }

  return bestScore >= 1 ? bestMode : 'chat'
}

export function modeSearchTopic(mode: OSMode, message: string): string {
  if (message.trim()) return message.trim()

  const defaults: Partial<Record<OSMode, string>> = {
    daily_plan: 'daily planning productivity time blocking',
    weekly_review: 'weekly review personal productivity',
    goal_breakdown: 'goal setting milestone planning',
    brainstorm: 'brainstorming techniques',
    essay_ideas: 'college personal essay themes',
    project_ideas: 'high school portfolio project ideas',
    coding_ideas: 'programming project ideas learning',
    soccer_drills: 'soccer training drills youth development',
    research_topics: 'research methods learning topics',
    college_planning: 'college application planning timeline',
    scholarship_ideas: 'merit scholarship search strategies',
    personal_recommendations: 'personal development recommendations',
    reflection: 'reflective journaling prompts',
    project_management: 'task prioritization project management',
  }

  return defaults[mode] ?? 'personal productivity operating system'
}
