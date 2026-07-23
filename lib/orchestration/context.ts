import type { SupabaseClient } from '@supabase/supabase-js'
import type { OSContextSummary, OSUserContext } from './types.js'

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function checklistProgress(checklist: unknown): number {
  if (!Array.isArray(checklist) || checklist.length === 0) return 0
  const completed = checklist.filter((item) => item && typeof item === 'object' && (item as { completed?: boolean }).completed).length
  return Math.round((completed / checklist.length) * 100)
}

export async function assembleOSContext(
  client: SupabaseClient,
  userId: string,
): Promise<OSUserContext> {
  const since14 = daysAgo(14)

  const [tasksRes, goalsRes, journalRes, trainingRes, runsRes, collegesRes, userDataRes, insightsRes] =
    await Promise.all([
      client.from('tasks').select('title, completed, priority, deadline').eq('user_id', userId).order('updated_at', { ascending: false }).limit(40),
      client.from('goals').select('title, progress, status, category').eq('user_id', userId).order('updated_at', { ascending: false }).limit(20),
      client.from('journal_entries').select('entry_date, mood, reflection').eq('user_id', userId).gte('entry_date', since14).order('entry_date', { ascending: false }).limit(14),
      client.from('training_sessions').select('session_date, duration_min, intensity, position_played').eq('user_id', userId).gte('session_date', since14).order('session_date', { ascending: false }).limit(20),
      client.from('run_logs').select('run_date, distance_m, duration_sec').eq('user_id', userId).gte('run_date', since14).order('run_date', { ascending: false }).limit(20),
      client.from('colleges').select('name, status, checklist').eq('user_id', userId).order('name').limit(20),
      client.from('college_user_data').select('resume_settings').eq('user_id', userId).maybeSingle(),
      client.from('soccer_insights').select('insight_type, title').eq('user_id', userId).limit(20),
    ])

  const tasks = (tasksRes.data ?? []).map((t) => ({
    title: t.title as string,
    completed: t.completed as boolean,
    priority: t.priority as string,
    deadline: (t.deadline as string | null)?.slice(0, 10) ?? null,
  }))

  const goals = (goalsRes.data ?? []).map((g) => ({
    title: g.title as string,
    progress: g.progress as number,
    status: g.status as string,
    category: g.category as string | null,
  }))

  const journal = (journalRes.data ?? []).map((j) => ({
    date: j.entry_date as string,
    mood: j.mood as string,
    reflection: j.reflection as string | null,
  }))

  const training = (trainingRes.data ?? []).map((s) => ({
    date: s.session_date as string,
    durationMin: s.duration_min as number,
    intensity: s.intensity as number,
    position: s.position_played as string,
  }))

  const runs = (runsRes.data ?? []).map((r) => ({
    date: r.run_date as string,
    distanceKm: Math.round(((r.distance_m as number) / 1000) * 10) / 10,
    durationMin: Math.round((r.duration_sec as number) / 60),
  }))

  const resumeSettings = userDataRes.data?.resume_settings as
    | { applicationPhase?: string; studentProfile?: { name?: string; graduationYear?: string } }
    | undefined

  const collegePhase =
    resumeSettings?.applicationPhase === 'senior'
      ? 'senior'
      : resumeSettings?.applicationPhase === 'junior'
        ? 'junior'
        : 'unknown'

  const schools = (collegesRes.data ?? []).map((c) => ({
    name: c.name as string,
    status: c.status as string,
    progress: checklistProgress(c.checklist),
  }))

  const weaknesses: string[] = []
  const strengths: string[] = []
  for (const row of insightsRes.data ?? []) {
    const title = row.title as string
    if (row.insight_type === 'weakness') weaknesses.push(title)
    if (row.insight_type === 'strength') strengths.push(title)
  }

  const openTasks = tasks.filter((t) => !t.completed).length
  const completedTasks = tasks.filter((t) => t.completed).length
  const activeGoals = goals.filter((g) => g.status === 'active').length

  const summary: OSContextSummary = {
    openTasks,
    completedTasks,
    activeGoals,
    journalEntriesLast14Days: journal.length,
    trainingSessionsLast14Days: training.length,
    runsLast14Days: runs.length,
    collegesOnList: schools.length,
    collegePhase,
  }

  return {
    summary,
    tasks: tasks.slice(0, 15),
    goals: goals.filter((g) => g.status === 'active').slice(0, 8),
    journal: journal.slice(0, 7),
    training: training.slice(0, 8),
    runs: runs.slice(0, 6),
    college: {
      phase: collegePhase,
      studentName: resumeSettings?.studentProfile?.name ?? null,
      graduationYear: resumeSettings?.studentProfile?.graduationYear ?? null,
      schools: schools.slice(0, 10),
    },
    soccer: {
      weaknesses: weaknesses.slice(0, 6),
      strengths: strengths.slice(0, 6),
      sessionsLast14Days: training.length,
    },
  }
}

export function formatOSContextBlock(ctx: OSUserContext): string {
  const lines: string[] = ['## User operating context (live data)']

  lines.push(
    `Summary: ${ctx.summary.openTasks} open tasks, ${ctx.summary.activeGoals} active goals, ${ctx.summary.journalEntriesLast14Days} journal entries (14d), ${ctx.summary.trainingSessionsLast14Days} training sessions (14d), ${ctx.summary.collegesOnList} colleges (${ctx.summary.collegePhase} phase).`,
  )

  if (ctx.tasks.length > 0) {
    lines.push('\n### Tasks')
    for (const t of ctx.tasks.slice(0, 10)) {
      const due = t.deadline ? ` · due ${t.deadline}` : ''
      lines.push(`- [${t.completed ? 'x' : ' '}] ${t.title} (${t.priority})${due}`)
    }
  }

  if (ctx.goals.length > 0) {
    lines.push('\n### Active goals')
    for (const g of ctx.goals) {
      lines.push(`- ${g.title}: ${g.progress}%${g.category ? ` · ${g.category}` : ''}`)
    }
  }

  if (ctx.journal.length > 0) {
    lines.push('\n### Recent journal')
    for (const j of ctx.journal.slice(0, 5)) {
      const snippet = j.reflection ? `: ${j.reflection.slice(0, 120)}` : ''
      lines.push(`- ${j.date} (${j.mood})${snippet}`)
    }
  }

  if (ctx.training.length > 0) {
    lines.push('\n### Recent training')
    for (const s of ctx.training.slice(0, 5)) {
      lines.push(`- ${s.date}: ${s.durationMin}min, intensity ${s.intensity}, ${s.position}`)
    }
  }

  if (ctx.runs.length > 0) {
    lines.push('\n### Recent runs')
    for (const r of ctx.runs.slice(0, 4)) {
      lines.push(`- ${r.date}: ${r.distanceKm} km in ${r.durationMin} min`)
    }
  }

  if (ctx.college.schools.length > 0 || ctx.college.studentName) {
    lines.push('\n### College prep')
    if (ctx.college.studentName) {
      lines.push(`- Student: ${ctx.college.studentName}${ctx.college.graduationYear ? ` · class of ${ctx.college.graduationYear}` : ''}`)
    }
    lines.push(`- Phase: ${ctx.college.phase}`)
    for (const s of ctx.college.schools.slice(0, 6)) {
      lines.push(`- ${s.name} (${s.status}) · ${s.progress}% prep`)
    }
  }

  if (ctx.soccer.weaknesses.length > 0 || ctx.soccer.strengths.length > 0) {
    lines.push('\n### Soccer profile')
    if (ctx.soccer.strengths.length > 0) lines.push(`- Strengths: ${ctx.soccer.strengths.join(', ')}`)
    if (ctx.soccer.weaknesses.length > 0) lines.push(`- Weaknesses: ${ctx.soccer.weaknesses.join(', ')}`)
    lines.push(`- Sessions (14d): ${ctx.soccer.sessionsLast14Days}`)
  }

  return lines.join('\n')
}

export function formatPatternsBlock(insights: import('./types.js').ProactiveInsight[]): string | undefined {
  if (insights.length === 0) return undefined
  const lines = ['## Proactive pattern insights', 'Use these to suggest improvements — do not ignore them.']
  for (const i of insights.slice(0, 5)) {
    lines.push(`- [${i.priority}] **${i.title}**: ${i.description}`)
  }
  return lines.join('\n')
}
