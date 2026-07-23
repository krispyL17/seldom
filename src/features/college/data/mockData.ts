import type { AdvisorMessage } from '../types'

export const advisorWelcomeMessage: AdvisorMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content:
    'Welcome! I can help you explore schools, plan testing, compare fit, and prepare for application season. What would you like to work on?',
  timestamp: new Date().toISOString(),
}
