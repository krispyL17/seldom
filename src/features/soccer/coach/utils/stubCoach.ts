import { coachPrompt } from '@config/coachPrompt'
import type { CoachInsight } from '../types'

export const COACH_WELCOME = coachPrompt.welcome ?? coachPrompt.system.slice(0, 200)
export const DEFAULT_COACH_SUGGESTIONS = coachPrompt.suggestions

export function getStubCoachReply(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('match')) {
    return '**Match analysis** needs your logged match data and OpenAI keys configured. Once connected, I\'ll review recent results, ratings, and highlights to suggest tactical adjustments.'
  }
  if (lower.includes('training') || lower.includes('load') || lower.includes('week')) {
    return '**Training plan** generation uses your session history and load metrics. Connect the coach API locally with `npm run dev:vercel` and your OpenAI key to get a full weekly periodization plan.'
  }
  if (lower.includes('weak foot') || lower.includes('technical')) {
    return '**Technical work**: I\'ll target your lowest session ratings and logged weaknesses with specific drills. Add training sessions with technical ratings so I can personalize recommendations.'
  }
  if (lower.includes('overtrain') || lower.includes('recovery')) {
    return '**Load check**: I compare session frequency, intensity, and energy levels over the last 14 days. Log a few sessions and I can flag overtraining risk.'
  }

  return 'Soccer coach is in local mode. Run `npm run dev:vercel` with OpenAI + Supabase env vars for live coaching, or deploy to Vercel with those keys set.'
}

export function getStubInsight(mode: CoachInsight['mode']): string {
  const stubs: Record<CoachInsight['mode'], string> = {
    training_plan: 'Log training sessions to unlock a personalized weekly plan. Sessions drive load calculations and drill selection.',
    technical: 'Add technical ratings to your training sessions. I\'ll prioritize your lowest-rated skills with drill progressions.',
    tactical: 'Log match results and position data. Tactical advice will align with your recent performances and role.',
    development: 'Set active goals and track weaknesses/strengths. I\'ll build a multi-week development roadmap from that profile.',
  }
  return stubs[mode]
}
