import type { OSMode, OSModuleDefinition, OSModuleId } from './types.js'

export const OS_MODULES: OSModuleDefinition[] = [
  {
    id: 'daily_planning',
    mode: 'daily_plan',
    label: 'Daily planning',
    description: 'Time-blocked plan tied to goals and energy',
    keywords: ['daily', 'today', 'tomorrow', 'plan my day', 'schedule', 'morning routine'],
  },
  {
    id: 'weekly_reviews',
    mode: 'weekly_review',
    label: 'Weekly review',
    description: 'Reflect on the week and adjust priorities',
    keywords: ['weekly', 'week review', 'summarize my week', 'this week', 'retrospective'],
  },
  {
    id: 'goal_breakdown',
    mode: 'goal_breakdown',
    label: 'Goal breakdown',
    description: 'Milestones and weekly actions for long-term goals',
    keywords: ['goal', 'milestone', 'break down', 'long-term', 'objective'],
  },
  {
    id: 'brainstorming',
    mode: 'brainstorm',
    label: 'Brainstorming',
    description: 'Structured idea generation and prioritization',
    keywords: ['brainstorm', 'ideas for', 'think of', 'creative'],
  },
  {
    id: 'essay_ideas',
    mode: 'essay_ideas',
    label: 'Essay ideas',
    description: 'Personal statement angles from your story',
    keywords: ['essay', 'personal statement', 'common app', 'supplemental'],
  },
  {
    id: 'project_ideas',
    mode: 'project_ideas',
    label: 'Project ideas',
    description: 'Portfolio and passion projects',
    keywords: ['project idea', 'portfolio', 'build something', 'side project'],
  },
  {
    id: 'coding_ideas',
    mode: 'coding_ideas',
    label: 'Coding ideas',
    description: 'Practice projects and learning paths',
    keywords: ['code', 'coding', 'typescript', 'programming', 'software', 'api'],
  },
  {
    id: 'soccer_drills',
    mode: 'soccer_drills',
    label: 'Soccer drills',
    description: 'Drills from training data and weaknesses',
    keywords: ['drill', 'soccer', 'training', 'first touch', 'football', 'practice'],
  },
  {
    id: 'research_topics',
    mode: 'research_topics',
    label: 'Research topics',
    description: 'Topics and reading paths to explore',
    keywords: ['research', 'learn about', 'read about', 'study topic'],
  },
  {
    id: 'college_planning',
    mode: 'college_planning',
    label: 'College planning',
    description: 'List-building, testing, and prep timeline',
    keywords: ['college', 'university', 'application', 'campus visit', 'sat', 'act'],
  },
  {
    id: 'scholarship_ideas',
    mode: 'scholarship_ideas',
    label: 'Scholarship ideas',
    description: 'Scholarship search strategies and fit',
    keywords: ['scholarship', 'merit aid', 'financial aid', 'fafsa'],
  },
  {
    id: 'personal_recommendations',
    mode: 'personal_recommendations',
    label: 'Personal recommendations',
    description: 'Tailored life and productivity suggestions',
    keywords: ['recommend', 'what should i', 'suggest', 'advice for me'],
  },
  {
    id: 'reflection',
    mode: 'reflection',
    label: 'Reflection',
    description: 'Guided journaling and reframing',
    keywords: ['reflect', 'journal', 'gratitude', 'how am i doing', 'wins'],
  },
  {
    id: 'project_management',
    mode: 'project_management',
    label: 'Project management',
    description: 'Prioritize tasks and manage deadlines',
    keywords: ['prioritize', 'deadline', 'tasks', 'overwhelmed', 'backlog', 'project manage'],
  },
  {
    id: 'memory_retrieval',
    mode: 'chat',
    label: 'Memory retrieval',
    description: 'Recall context from your semantic memory',
    keywords: ['remember', 'recall', 'what did i', 'last time'],
  },
]

export function getModuleByMode(mode: OSMode): OSModuleDefinition | undefined {
  if (mode === 'chat') return undefined
  return OS_MODULES.find((m) => m.mode === mode)
}

export function getModuleById(id: OSModuleId): OSModuleDefinition | undefined {
  return OS_MODULES.find((m) => m.id === id)
}

export const VALID_MODES: OSMode[] = [
  'chat',
  'daily_plan',
  'weekly_review',
  'goal_breakdown',
  'brainstorm',
  'essay_ideas',
  'project_ideas',
  'coding_ideas',
  'soccer_drills',
  'research_topics',
  'college_planning',
  'scholarship_ideas',
  'personal_recommendations',
  'reflection',
  'project_management',
]
