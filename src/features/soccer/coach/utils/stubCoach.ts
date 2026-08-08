import { coachPrompt } from '@config/coachPrompt'
import { formatCoachWelcome } from './personalize'
import type { CoachInsight } from '../types'

export const COACH_WELCOME = coachPrompt.welcome ?? coachPrompt.system.slice(0, 200)
export const DEFAULT_COACH_SUGGESTIONS = coachPrompt.suggestions

export function buildCoachWelcome(displayName?: string | null): string {
  return formatCoachWelcome(COACH_WELCOME, displayName)
}

export function getStubCoachReply(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('training') || lower.includes('load') || lower.includes('week')) {
    return 'Log a few practice sessions with your focus and “to work on” notes — then use **Generate** in the recommendations panel for a weekly plan tailored to your load.'
  }
  if (lower.includes('technical') || lower.includes('skill')) {
    return 'Add session focus and “to work on” notes when you log practice. I\'ll prioritize those areas in drill suggestions once connected.'
  }
  if (lower.includes('overtrain') || lower.includes('recovery')) {
    return 'I compare session frequency, intensity, and energy over time. Keep logging sessions and I can flag recovery needs.'
  }

  return 'Sign in and start **Ollama** with `OLLAMA_MODEL` set in `.env.local` so I can answer using your session history.'
}

export function getStubInsight(mode: CoachInsight['mode']): string {
  const stubs: Record<CoachInsight['mode'], string> = {
    training_plan: 'Log practice sessions, then click **Generate** for a personalized weekly plan.',
    technical: 'Add session focus and “to work on” notes — insights will target those areas.',
    tactical: 'Log session notes and goals — guidance will align with your recent work.',
    development: 'Set active goals and track development areas for a multi-week roadmap.',
  }
  return stubs[mode]
}
