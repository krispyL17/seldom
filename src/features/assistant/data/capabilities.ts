import type { AssistantMode, AssistantModule, ProactiveInsight } from '@services/assistant/assistantClient'

export const FALLBACK_MODULES: AssistantModule[] = [
  { id: 'daily_planning', mode: 'daily_plan', label: 'Daily planning', description: 'Time-blocked plan tied to goals', keywords: [] },
  { id: 'weekly_reviews', mode: 'weekly_review', label: 'Weekly review', description: 'Reflect and adjust priorities', keywords: [] },
  { id: 'goal_breakdown', mode: 'goal_breakdown', label: 'Goal breakdown', description: 'Milestones and weekly actions', keywords: [] },
  { id: 'brainstorming', mode: 'brainstorm', label: 'Brainstorming', description: 'Structured idea generation', keywords: [] },
  { id: 'essay_ideas', mode: 'essay_ideas', label: 'Essay ideas', description: 'Personal statement angles', keywords: [] },
  { id: 'project_ideas', mode: 'project_ideas', label: 'Project ideas', description: 'Portfolio projects', keywords: [] },
  { id: 'coding_ideas', mode: 'coding_ideas', label: 'Coding ideas', description: 'Practice and learning paths', keywords: [] },
  { id: 'soccer_drills', mode: 'soccer_drills', label: 'Soccer drills', description: 'Targeted training drills', keywords: [] },
  { id: 'research_topics', mode: 'research_topics', label: 'Research topics', description: 'Topics to explore', keywords: [] },
  { id: 'college_planning', mode: 'college_planning', label: 'College planning', description: 'List-building and timeline', keywords: [] },
  { id: 'scholarship_ideas', mode: 'scholarship_ideas', label: 'Scholarship ideas', description: 'Search strategies', keywords: [] },
  { id: 'personal_recommendations', mode: 'personal_recommendations', label: 'Personal recommendations', description: 'Tailored suggestions', keywords: [] },
  { id: 'reflection', mode: 'reflection', label: 'Reflection', description: 'Guided journaling', keywords: [] },
  { id: 'project_management', mode: 'project_management', label: 'Project management', description: 'Prioritize and sequence work', keywords: [] },
]

export const FALLBACK_SUGGESTIONS = [
  'Plan my day around my goals',
  'Run my weekly review',
  'Break down my top goal',
  'Suggest essay themes from my activities',
  'Recommend soccer drills for this week',
]

export const FALLBACK_WELCOME = `Hello! I'm **Seldom OS** — your proactive personal operating system.

I help with daily planning, weekly reviews, goal breakdown, reflection, college prep, soccer training, projects, and more. Pick a capability or ask anything.`

export const MODE_LABELS: Record<AssistantMode, string> = {
  chat: 'General',
  daily_plan: 'Daily planning',
  weekly_review: 'Weekly review',
  goal_breakdown: 'Goal breakdown',
  brainstorm: 'Brainstorming',
  essay_ideas: 'Essay ideas',
  project_ideas: 'Project ideas',
  coding_ideas: 'Coding ideas',
  soccer_drills: 'Soccer drills',
  research_topics: 'Research topics',
  college_planning: 'College planning',
  scholarship_ideas: 'Scholarship ideas',
  personal_recommendations: 'Recommendations',
  reflection: 'Reflection',
  project_management: 'Project management',
}

export function insightActionPrompt(insight: ProactiveInsight): string {
  return `Help me with this: ${insight.title} — ${insight.description}`
}
