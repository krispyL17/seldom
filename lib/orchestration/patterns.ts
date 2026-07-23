import type { OSMode, OSUserContext, ProactiveInsight } from './types.js'

export function detectProactivePatterns(ctx: OSUserContext): ProactiveInsight[] {
  const insights: ProactiveInsight[] = []
  const { summary, tasks, goals, journal, college, soccer } = ctx

  const overdueTasks = tasks.filter(
    (t) => !t.completed && t.deadline && t.deadline < new Date().toISOString().slice(0, 10),
  )
  if (overdueTasks.length > 0) {
    insights.push({
      id: 'overdue-tasks',
      title: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
      description: `"${overdueTasks[0].title}" and others need attention — reprioritize or reschedule.`,
      suggestedMode: 'project_management',
      priority: 'high',
    })
  }

  if (summary.openTasks >= 8 && summary.completedTasks > 0) {
    const rate = Math.round((summary.completedTasks / (summary.openTasks + summary.completedTasks)) * 100)
    if (rate < 40) {
      insights.push({
        id: 'low-task-completion',
        title: 'Task completion is lagging',
        description: `Only ~${rate}% of tracked tasks are done. Consider a daily planning session.`,
        suggestedMode: 'daily_plan',
        priority: 'medium',
      })
    }
  }

  if (summary.activeGoals > 0) {
    const stagnant = goals.filter((g) => g.progress < 20)
    if (stagnant.length >= 2) {
      insights.push({
        id: 'stagnant-goals',
        title: 'Goals need clearer next steps',
        description: `${stagnant.length} active goals are below 20% progress. Break them into weekly actions.`,
        suggestedMode: 'goal_breakdown',
        priority: 'high',
      })
    }
  }

  if (summary.journalEntriesLast14Days === 0) {
    insights.push({
      id: 'journal-gap',
      title: 'No journal entries recently',
      description: 'Reflection improves consistency. Try a 5-minute evening check-in.',
      suggestedMode: 'reflection',
      priority: 'medium',
    })
  } else if (summary.journalEntriesLast14Days < 3) {
    insights.push({
      id: 'journal-sparse',
      title: 'Journal consistency is low',
      description: 'Only a few entries in 14 days. A weekly review could rebuild the habit.',
      suggestedMode: 'weekly_review',
      priority: 'low',
    })
  }

  if (summary.trainingSessionsLast14Days === 0 && soccer.weaknesses.length > 0) {
    insights.push({
      id: 'training-gap',
      title: 'No training logged in 2 weeks',
      description: 'You have tracked weaknesses but no recent sessions. Plan targeted drills.',
      suggestedMode: 'soccer_drills',
      priority: 'high',
    })
  }

  if (college.phase === 'junior' && summary.collegesOnList === 0) {
    insights.push({
      id: 'college-list-empty',
      title: 'College list is empty',
      description: 'Start exploring schools and add any you are curious about — no preset list required.',
      suggestedMode: 'college_planning',
      priority: 'medium',
    })
  }

  if (college.phase === 'junior' && summary.collegesOnList > 0 && summary.collegesOnList < 3) {
    insights.push({
      id: 'college-list-small',
      title: 'Build a balanced college list',
      description: 'Aim for reach, target, and safety options as you research.',
      suggestedMode: 'college_planning',
      priority: 'low',
    })
  }

  if (summary.activeGoals === 0 && summary.openTasks === 0) {
    insights.push({
      id: 'empty-os',
      title: 'Define your next north star',
      description: 'No active goals or open tasks. Brainstorm what matters this month.',
      suggestedMode: 'brainstorm',
      priority: 'medium',
    })
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

export function insightPrompt(mode: OSMode, insight: ProactiveInsight): string {
  return `[${insight.title}] ${insight.description}`
}
