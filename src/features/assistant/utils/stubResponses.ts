import type { RetrievedMemory } from '@services/memory'
import type { SearchResponse } from '@services/search'

export interface AssistantContext {
  memoryContext?: string
  memories: RetrievedMemory[]
  search?: SearchResponse
}

/**
 * Builds assistant reply using memory + web search context (stub until LLM is connected).
 */
export function getStubReply(userMessage: string, context: AssistantContext = { memories: [] }): string {
  const { memoryContext, memories, search } = context
  const lower = userMessage.toLowerCase()

  const memorySection =
    memories.length > 0
      ? `\n\n---\n\n**Memory retrieval** (${memories.length} relevant ${memories.length === 1 ? 'memory' : 'memories'}):\n\n${memoryContext}\n\n*Ranked by similarity, importance, and recency — not the full database.*`
      : ''

  const searchSection =
    search && !search.skipped && search.results.length > 0
      ? `\n\n---\n\n**Web search** (${search.provider}, ${search.results.length} trusted ${search.results.length === 1 ? 'result' : 'results'}):\n\n${search.summary}\n\n${search.contextBlock}\n\n*Only trusted domains are included.*`
      : ''

  const contextSections = `${memorySection}${searchSection}`

  if (lower.includes('code') || lower.includes('typescript') || lower.includes('function')) {
    return `Here's an example **TypeScript** helper you could use in Seldom:

\`\`\`typescript
export function formatDeadline(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
\`\`\`

> AI responses are simulated for now. Connect a model later to get real answers.${contextSections}`
  }

  if (lower.includes('college') || lower.includes('application')) {
    return `For **college prep**, I'd suggest focusing on:

1. Balancing your list (reach / target / safety)
2. Logging activities in Seldom's Activities tab
3. Starting essay themes before senior year

Use **"I'm a senior now"** in the College section when application season starts.

*Preview mode — no AI model connected yet.*${contextSections}`
  }

  if (lower.includes('plan') || lower.includes('tomorrow') || lower.includes('week')) {
    return `Here's a simple planning framework:

- **Morning:** Highest-focus task (60–90 min)
- **Afternoon:** Meetings, errands, lighter work
- **Evening:** Review & journal

Want me to tie this to your Tasks module once AI is connected?${contextSections}`
  }

  if (memories.length > 0 || (search && search.results.length > 0)) {
    return `I gathered context from your semantic memory and trusted web sources.${contextSections}

*Preview mode — connect an LLM to generate answers from this context.*`
  }

  return `Thanks for your message. I'm Seldom's assistant UI — **ChatGPT-style interface**, preview mode only.

I can help with tasks, goals, journal, soccer, and college prep. Try asking **"What is early action?"** or **"How to improve first touch?"** to trigger web search.

*Start sidecars with \`npm run services\` (memory + search). Ollama needs \`nomic-embed-text\` for memory.*`
}

export const WELCOME_MESSAGE = `Hello! I'm **Seldom Assistant** — your personal AI operating system companion.

Before each reply I retrieve your **memories** and search **trusted sources** when needed. On Vercel this runs automatically — just sign in and ask.

Try a suggestion below or type your own message.`
