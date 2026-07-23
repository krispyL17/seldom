import type { AssistantMode } from '@services/assistant/assistantClient'
import type { RetrievedMemory } from '@services/memory'
import type { SearchResponse } from '@services/search'
import { MODE_LABELS } from '../data/capabilities'

export interface AssistantContext {
  memoryContext?: string
  memories: RetrievedMemory[]
  search?: SearchResponse
  mode?: AssistantMode
}

export function getStubReply(userMessage: string, context: AssistantContext = { memories: [] }): string {
  const { memoryContext, memories, search, mode } = context
  const lower = userMessage.toLowerCase()
  const modeLabel = mode && mode !== 'chat' ? MODE_LABELS[mode] : null

  const memorySection =
    memories.length > 0
      ? `\n\n---\n\n**Memory retrieval** (${memories.length} relevant ${memories.length === 1 ? 'memory' : 'memories'}):\n\n${memoryContext}\n\n*Ranked by similarity, importance, and recency.*`
      : ''

  const searchSection =
    search && !search.skipped && search.results.length > 0
      ? `\n\n---\n\n**Web search** (${search.provider}, ${search.results.length} results):\n\n${search.summary}\n\n${search.contextBlock}`
      : ''

  const contextSections = `${memorySection}${searchSection}`
  const modeNote = modeLabel ? `\n\n*Active capability: **${modeLabel}***` : ''

  if (lower.includes('plan') || lower.includes('tomorrow') || lower.includes('daily') || mode === 'daily_plan') {
    return `## Daily Plan (preview)

**Morning (60–90 min):** Highest-focus task tied to your top goal  
**Midday:** Lighter admin + one learning block  
**Evening:** 10-min reflection + prep tomorrow's top 3

Connect \`OPENAI_API_KEY\` for a personalized plan from your tasks and goals.${modeNote}${contextSections}`
  }

  if (lower.includes('week') || lower.includes('review') || mode === 'weekly_review') {
    return `## Weekly Review (preview)

1. **Wins** — what moved your goals forward?  
2. **Challenges** — what blocked you?  
3. **Adjust** — one change for next week

Live weekly reviews use your journal, tasks, training, and college data.${modeNote}${contextSections}`
  }

  if (lower.includes('goal') || mode === 'goal_breakdown') {
    return `## Goal Breakdown (preview)

Pick one goal → define **milestones** → assign **weekly actions** → set a **checkpoint date**.

The OS orchestrator reads your active goals from Supabase when connected.${modeNote}${contextSections}`
  }

  if (lower.includes('college') || mode === 'college_planning' || mode === 'scholarship_ideas') {
    return `## College OS (preview)

Rising-junior mode: explore schools, build your list, plan testing — no preset schools.

Ask about list balance, essay themes, or scholarship search strategies once the API is connected.${modeNote}${contextSections}`
  }

  if (lower.includes('drill') || lower.includes('soccer') || mode === 'soccer_drills') {
    return `## Soccer Drills (preview)

For full drill plans with your training history, use **Soccer → AI Coach** or connect the OS assistant API.

Stub mode gives generic guidance only.${modeNote}${contextSections}`
  }

  if (memories.length > 0 || (search && search.results.length > 0)) {
    return `Seldom OS gathered context from memory and search.${modeNote}${contextSections}

*Connect \`OPENAI_API_KEY\` for full modular orchestration.*`
  }

  return `Thanks for your message. **Seldom OS** routes requests through modular capabilities — daily planning, weekly reviews, goals, college, soccer, reflection, and more.

Run \`npm run dev:vercel\` or deploy with \`OPENAI_API_KEY\` for live orchestration.${modeNote}${contextSections}`
}

export const WELCOME_MESSAGE = `Hello! I'm **Seldom OS** — your proactive personal operating system.

I help you achieve long-term goals through daily planning, weekly reviews, reflection, and domain-specific coaching. Pick a capability or ask anything.`
