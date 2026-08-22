import type { PulseSummary, WeekHeadline, WeekHeadlineTone } from './types.js'

export interface NarrativeInput {
  trainingThisWeek: number
  trainingLastWeek: number
  journalDaysLast14: number
  overdueTasks: number
  openTasks: number
  collegePhase: 'junior' | 'senior' | 'unknown'
  nearestDeadlineDays: number | null
  nearestDeadlineLabel: string | null
  collegeProgress: number
  collegesOnList: number
}

function toneFromSignals(input: NarrativeInput): WeekHeadlineTone {
  if (input.overdueTasks > 0 && input.nearestDeadlineDays != null && input.nearestDeadlineDays <= 14) {
    return 'urgent'
  }
  if (input.trainingThisWeek >= 3 && input.journalDaysLast14 >= 4) return 'strong'
  if (input.trainingThisWeek === 0 && input.journalDaysLast14 === 0 && input.openTasks === 0) {
    return 'quiet'
  }
  return 'mixed'
}

const ADJECTIVES: Record<WeekHeadlineTone, string> = {
  strong: 'Strong week',
  mixed: 'Mixed week',
  quiet: 'Quiet week',
  urgent: 'Crunch time',
}

export function buildWeekHeadline(input: NarrativeInput): WeekHeadline {
  const tone = toneFromSignals(input)
  const parts: string[] = []

  if (input.trainingThisWeek > 0) {
    parts.push(
      input.trainingThisWeek === 1
        ? '1 session logged'
        : `${input.trainingThisWeek} sessions logged`,
    )
  }

  if (input.journalDaysLast14 > 0) {
    parts.push(`${input.journalDaysLast14} journal days in 14`)
  }

  if (
    input.collegePhase === 'senior' &&
    input.nearestDeadlineDays != null &&
    input.nearestDeadlineLabel
  ) {
    parts.push(`${input.nearestDeadlineLabel} in ${input.nearestDeadlineDays} days`)
  } else if (input.collegePhase === 'junior' && input.collegesOnList === 0) {
    parts.push('start building your college list when ready')
  } else if (input.collegePhase === 'senior' && input.collegeProgress > 0) {
    parts.push(`${input.collegeProgress}% through checklists`)
  }

  if (input.overdueTasks > 0) {
    parts.unshift(
      input.overdueTasks === 1 ? '1 overdue task' : `${input.overdueTasks} overdue tasks`,
    )
  }

  const sentence =
    parts.length > 0
      ? parts.join(' · ')
      : 'Log a session, task, or journal entry to start your week story.'

  return { tone, adjective: ADJECTIVES[tone], sentence }
}

export function buildPulseSummary(input: NarrativeInput): PulseSummary {
  const trainingSessions = input.trainingThisWeek
  const journalDays = input.journalDaysLast14
  const messageParts: string[] = []

  if (trainingSessions >= 4 && input.overdueTasks >= 2) {
    messageParts.push('Heavy training week with tasks piling up — lighter session today, then knock out overdue items.')
  } else if (trainingSessions === 0 && input.openTasks > 0) {
    messageParts.push('No training logged yet this week — one focused session can reset momentum.')
  } else if (
    input.collegePhase === 'senior' &&
    input.nearestDeadlineDays != null &&
    input.nearestDeadlineDays <= 10
  ) {
    messageParts.push(
      `Deadline pressure is real — protect a block for ${input.nearestDeadlineLabel ?? 'applications'} alongside recovery.`,
    )
  } else if (journalDays >= 5 && trainingSessions >= 2) {
    messageParts.push('Good balance of reflection and work — keep the rhythm going.')
  } else if (journalDays === 0 && trainingSessions > 0) {
    messageParts.push('Training is logged but journal is quiet — a 5-minute reflection closes the loop.')
  } else {
    messageParts.push('Small consistent reps beat cramming — one focused hour today moves everything forward.')
  }

  return {
    trainingSessions,
    journalDays,
    openTasks: input.openTasks,
    overdueTasks: input.overdueTasks,
    collegeApps: input.collegesOnList,
    collegeProgress: input.collegeProgress,
    message: messageParts[0] ?? 'Keep logging — your stats get smarter as you go.',
  }
}

export function buildDailyInsight(
  headline: WeekHeadline,
  pulse: PulseSummary,
  topInsightTitle: string | null,
): string {
  const lead = `${headline.adjective} — ${headline.sentence}`
  if (topInsightTitle) {
    return `${lead} ${pulse.message} Priority: ${topInsightTitle}.`
  }
  return `${lead} ${pulse.message}`
}
