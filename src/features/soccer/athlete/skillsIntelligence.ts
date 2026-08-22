import type { SoccerMatch } from '../matches/types'
import type { TrainingSession } from '../training/types'
import type { TrainingSkill } from './types'
import { rollingWindowStartIso } from '@lib/rollingWindow'

export interface SkillLoadEntry {
  skill: TrainingSkill
  load: number
  sessionCount: number
  /** Share of logged load; null when the skill has never been touched in the window. */
  percent: number | null
}

export interface SkillsIntelligenceSnapshot {
  entries: SkillLoadEntry[]
  totalLoad: number
  balanceScore: number
  neglected: TrainingSkill[]
  dominant: TrainingSkill[]
  insight: string
}

const WINDOW_DAYS = 28

function sessionLoadUnits(durationMin: number, intensity: number, teamSession: boolean): number {
  const base = durationMin * (intensity / 10)
  return teamSession ? base * 0.5 : base
}

function matchLoadUnits(minutes: number): number {
  return minutes * 0.7
}

function inWindow(date: string, since: string): boolean {
  return date >= since && date <= new Date().toISOString().slice(0, 10)
}

export function computeSkillsIntelligence(
  skills: TrainingSkill[],
  sessions: TrainingSession[],
  matches: SoccerMatch[],
): SkillsIntelligenceSnapshot {
  if (skills.length === 0) {
    return {
      entries: [],
      totalLoad: 0,
      balanceScore: 100,
      neglected: [],
      dominant: [],
      insight: 'Add skills in the Skills tab to start tracking training distribution.',
    }
  }

  const sinceIso = rollingWindowStartIso(WINDOW_DAYS)

  const loads = new Map<string, number>()
  const counts = new Map<string, number>()
  for (const skill of skills) {
    loads.set(skill.id, 0)
    counts.set(skill.id, 0)
  }

  for (const session of sessions) {
    if (!inWindow(session.session_date, sinceIso)) continue
    const trained = session.skills_trained ?? []
    if (trained.length === 0) continue
    const unit =
      sessionLoadUnits(session.duration_min, session.intensity, session.team_session) / trained.length
    for (const skillId of trained) {
      if (!loads.has(skillId)) continue
      loads.set(skillId, (loads.get(skillId) ?? 0) + unit)
      counts.set(skillId, (counts.get(skillId) ?? 0) + 1)
    }
  }

  const gameTypes = new Set(['game', 'scrim', 'tournament'])
  for (const match of matches) {
    if (!inWindow(match.match_date, sinceIso)) continue
    const competition = (match.competition ?? '').toLowerCase()
    if (competition.includes('practice')) continue
    const eventKey = competition.includes('scrim')
      ? 'scrim'
      : competition.includes('tournament')
        ? 'tournament'
        : competition.includes('game') || competition === ''
          ? 'game'
          : null
    if (eventKey && !gameTypes.has(eventKey)) continue
    if (match.minutes <= 0) continue
    const unit = matchLoadUnits(match.minutes) / skills.length
    for (const skill of skills) {
      loads.set(skill.id, (loads.get(skill.id) ?? 0) + unit)
      counts.set(skill.id, (counts.get(skill.id) ?? 0) + 1)
    }
  }

  const totalLoad = [...loads.values()].reduce((s, v) => s + v, 0)
  const entries: SkillLoadEntry[] = skills.map((skill) => {
    const load = loads.get(skill.id) ?? 0
    const sessionCount = counts.get(skill.id) ?? 0
    const touched = load > 0 || sessionCount > 0
    return {
      skill,
      load: Math.round(load * 10) / 10,
      sessionCount,
      percent:
        totalLoad > 0 && touched ? Math.round((load / totalLoad) * 100) : null,
    }
  })

  const usedEntries = entries.filter((e): e is SkillLoadEntry & { percent: number } => e.percent != null)
  const percents = usedEntries.map((e) => e.percent)
  const avg = percents.length > 0 ? percents.reduce((s, p) => s + p, 0) / percents.length : 0
  const variance =
    percents.length > 0
      ? percents.reduce((s, p) => s + (p - avg) ** 2, 0) / percents.length
      : 0
  const balanceScore =
    percents.length === 0 ? 100 : Math.max(0, Math.round(100 - Math.sqrt(variance) * 2))

  const sortedUsed = [...usedEntries].sort((a, b) => a.percent - b.percent)
  const neglected = sortedUsed.filter((e) => e.percent < 15).map((e) => e.skill)
  const dominant = [...usedEntries]
    .sort((a, b) => b.percent - a.percent)
    .filter((e) => e.percent > 35)
    .map((e) => e.skill)

  let insight = 'Training looks fairly balanced across your skills.'
  if (totalLoad === 0) {
    insight = 'Log sessions with skills checked, or log games — distribution appears here.'
  } else if (neglected.length > 0 && dominant.length > 0) {
    insight = `Heavy on ${dominant[0]?.label ?? 'some skills'} — ${neglected.map((s) => s.label).join(', ')} getting less work.`
  } else if (neglected.length > 0) {
    insight = `Consider more reps on ${neglected.map((s) => s.label).join(', ')}.`
  } else if (dominant.length > 0) {
    insight = `Most volume on ${dominant.map((s) => s.label).join(', ')} — check if that matches your goals.`
  }

  return {
    entries,
    totalLoad: Math.round(totalLoad),
    balanceScore,
    neglected,
    dominant,
    insight,
  }
}
