/**
 * College-specific mock data for the college application module.
 * All values are static — will be replaced by Supabase / AI services later.
 */

export const advisorMessagesData = [
  {
    id: 'advisor-1',
    role: 'assistant' as const,
    content: 'Hi! I\'m here to help you navigate your college journey. What would you like to work on today?',
    timestamp: '2026-07-24T10:00:00Z',
  },
  {
    id: 'advisor-2',
    role: 'user' as const,
    content: 'I\'m trying to figure out which colleges to apply to. Can you help me build a balanced list?',
    timestamp: '2026-07-24T10:05:00Z',
  },
  {
    id: 'advisor-3',
    role: 'assistant' as const,
    content: 'Absolutely! A well-balanced college list typically includes reach schools (20-30%), match schools (40-50%), and safety schools (20-30%). Tell me about your academic interests and stats so I can provide personalized recommendations.',
    timestamp: '2026-07-24T10:07:00Z',
  },
]