import type { SupabaseClient } from '@supabase/supabase-js'
import type { SoccerPlayerContext } from './types.js'
import { resolveFirstName } from './personalize.js'

const TECHNICAL_LABELS: Record<string, string> = {
  first_touch: 'First Touch',
  passing: 'Passing',
  dribbling: 'Dribbling',
  crossing: 'Crossing',
  shooting: 'Shooting',
  decision_making: 'Decision Making',
  weak_foot: 'Weak Foot',
  acceleration: 'Acceleration',
  agility: 'Agility',
  confidence: 'Confidence',
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function parseRatings(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {}
  return raw as Record<string, number>
}

function deriveSkills(sessions: SoccerPlayerContext['trainingSessions']): SoccerPlayerContext['derivedSkills'] {
  const totals: Record<string, { sum: number; count: number }> = {}

  for (const session of sessions) {
    for (const [key, value] of Object.entries(session.ratings)) {
      if (typeof value !== 'number') continue
      if (!totals[key]) totals[key] = { sum: 0, count: 0 }
      totals[key].sum += value
      totals[key].count += 1
    }
  }

  return Object.entries(totals)
    .map(([key, { sum, count }]) => {
      const average = Math.round((sum / count) * 10) / 10
      const trend: 'low' | 'mid' | 'high' = average <= 5 ? 'low' : average >= 8 ? 'high' : 'mid'
      return {
        skill: TECHNICAL_LABELS[key] ?? key,
        average,
        trend,
      }
    })
    .sort((a, b) => a.average - b.average)
}

export async function assembleSoccerContext(
  client: SupabaseClient,
  userId: string,
): Promise<SoccerPlayerContext> {
  const since = daysAgo(90)

  const [sessionsRes, matchesRes, insightsRes, goalsRes, profileRes] = await Promise.all([
    client
      .from('training_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('session_date', since)
      .order('session_date', { ascending: false })
      .limit(20),
    client
      .from('soccer_matches')
      .select('*')
      .eq('user_id', userId)
      .gte('match_date', since)
      .order('match_date', { ascending: false })
      .limit(10),
    client.from('soccer_insights').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    client
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active'])
      .or('category.eq.soccer,category.eq.Soccer,category.eq.football,category.eq.Football,category.is.null')
      .order('created_at', { ascending: false })
      .limit(10),
    client.from('soccer_user_data').select('profile').eq('user_id', userId).maybeSingle(),
  ])

  const trainingSessions = (sessionsRes.data ?? []).map((row) => ({
    date: row.session_date as string,
    durationMin: row.duration_min as number,
    position: row.position_played as string,
    intensity: row.intensity as number,
    mood: row.mood as string,
    energy: row.energy_level as number,
    notes: row.notes as string | null,
    ratings: parseRatings(row.technical_ratings),
  }))

  const recent14 = trainingSessions.filter((s) => s.date >= daysAgo(14))
  const loadSummary = {
    sessionsLast14Days: recent14.length,
    totalMinutesLast14Days: recent14.reduce((sum, s) => sum + s.durationMin, 0),
    avgIntensityLast14Days:
      recent14.length > 0
        ? Math.round((recent14.reduce((sum, s) => sum + s.intensity, 0) / recent14.length) * 10) / 10
        : 0,
    avgEnergyLast14Days:
      recent14.length > 0
        ? Math.round((recent14.reduce((sum, s) => sum + s.energy, 0) / recent14.length) * 10) / 10
        : 0,
  }

  const matches = (matchesRes.data ?? []).map((row) => ({
    date: row.match_date as string,
    opponent: row.opponent as string,
    competition: row.competition as string | null,
    result: row.result as string,
    score: row.score as string | null,
    minutes: row.minutes as number,
    goals: row.goals as number,
    assists: row.assists as number,
    rating: row.rating != null ? Number(row.rating) : null,
    highlights: row.highlights as string | null,
  }))

  const insights = insightsRes.data ?? []
  const weaknesses = insights
    .filter((i) => i.insight_type === 'weakness')
    .map((i) => ({
      title: i.title as string,
      description: i.description as string | null,
      priority: i.priority as string | null,
      category: i.category as string | null,
    }))
  const strengths = insights
    .filter((i) => i.insight_type === 'strength')
    .map((i) => ({
      title: i.title as string,
      description: i.description as string | null,
      priority: i.priority as string | null,
      category: i.category as string | null,
    }))

  const goals = (goalsRes.data ?? []).map((row) => ({
    title: row.title as string,
    description: row.description as string | null,
    progress: row.progress as number,
    targetDate: row.target_date as string | null,
    status: row.status as string,
  }))

  return {
    playerProfile: profileRes.data?.profile as SoccerPlayerContext['playerProfile'],
    trainingSessions,
    matches,
    weaknesses,
    strengths,
    goals,
    derivedSkills: deriveSkills(trainingSessions),
    loadSummary,
  }
}

export function formatSoccerContextBlock(context: SoccerPlayerContext): string {
  const sections: string[] = ['## Player Profile Data']

  if (context.playerProfile?.name || context.playerProfile?.currentFocus) {
    const p = context.playerProfile
    sections.push(
      `### Identity\n- Name: ${p?.name ?? '—'}\n- Focus: ${p?.currentFocus ?? '—'}${p?.position ? `\n- Role/position: ${p.position}` : ''}`,
    )
  }

  if (context.trainingSessions.length > 0) {
    const lines = context.trainingSessions.slice(0, 8).map((s) => {
      const ratingLine = Object.entries(s.ratings)
        .map(([k, v]) => `${TECHNICAL_LABELS[k] ?? k}: ${v}/10`)
        .join(', ')
      return `- ${s.date} | ${s.durationMin}min | ${s.position} | intensity ${s.intensity}/10 | energy ${s.energy}/5 | mood ${s.mood}${s.notes ? ` | notes: ${s.notes}` : ''}${ratingLine ? ` | ratings: ${ratingLine}` : ''}`
    })
    sections.push('### Recent Training Sessions\n' + lines.join('\n'))
  } else {
    sections.push('### Recent Training Sessions\nNo logged sessions in the last 90 days.')
  }

  sections.push(
    `### Training Load (last 14 days)\n- Sessions: ${context.loadSummary.sessionsLast14Days}\n- Total minutes: ${context.loadSummary.totalMinutesLast14Days}\n- Avg intensity: ${context.loadSummary.avgIntensityLast14Days}/10\n- Avg energy: ${context.loadSummary.avgEnergyLast14Days}/5`,
  )

  if (context.matches.length > 0) {
    const lines = context.matches.slice(0, 6).map(
      (m) =>
        `- ${m.date} vs ${m.opponent} (${m.competition ?? '—'}) ${m.result} ${m.score ?? ''} | ${m.minutes}min | G${m.goals} A${m.assists}${m.rating != null ? ` | rating ${m.rating}/10` : ''}${m.highlights ? ` | ${m.highlights}` : ''}`,
    )
    sections.push('### Recent Matches\n' + lines.join('\n'))
  } else {
    sections.push('### Recent Matches\nNo logged matches in the last 90 days.')
  }

  if (context.weaknesses.length > 0) {
    sections.push(
      '### Weaknesses\n' +
        context.weaknesses
          .map(
            (w) =>
              `- [${w.priority ?? 'medium'}] ${w.title}${w.category ? ` (${w.category})` : ''}${w.description ? `: ${w.description}` : ''}`,
          )
          .join('\n'),
    )
  }

  if (context.strengths.length > 0) {
    sections.push(
      '### Strengths\n' +
        context.strengths
          .map(
            (s) =>
              `- [${s.priority ?? 'medium'}] ${s.title}${s.category ? ` (${s.category})` : ''}${s.description ? `: ${s.description}` : ''}`,
          )
          .join('\n'),
    )
  }

  if (context.derivedSkills.length > 0) {
    sections.push(
      '### Technical Ratings (derived from sessions)\n' +
        context.derivedSkills.map((s) => `- ${s.skill}: ${s.average}/10 (${s.trend})`).join('\n'),
    )
  }

  if (context.goals.length > 0) {
    sections.push(
      '### Active Goals\n' +
        context.goals
          .map(
            (g) =>
              `- ${g.title} (${g.progress}%${g.targetDate ? `, target ${g.targetDate}` : ''})${g.description ? `: ${g.description}` : ''}`,
          )
          .join('\n'),
    )
  }

  return sections.join('\n\n')
}

export async function resolvePlayerFirstName(
  client: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const [userRes, profileRes] = await Promise.all([
    client.auth.getUser(),
    client.from('soccer_user_data').select('profile').eq('user_id', userId).maybeSingle(),
  ])

  const displayName =
    typeof userRes.data.user?.user_metadata?.display_name === 'string'
      ? userRes.data.user.user_metadata.display_name
      : null
  const profileName =
    typeof (profileRes.data?.profile as { name?: string } | null)?.name === 'string'
      ? (profileRes.data?.profile as { name: string }).name
      : null

  return resolveFirstName(displayName, profileName)
}
