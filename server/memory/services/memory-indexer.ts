import type { CreateMemoryInput } from '../../../memory/types.js'
import type { EmbeddingService } from './embedding.service.js'

/**
 * Maps Seldom app entities into memory records.
 * Call these when journal entries, tasks, etc. are created or updated.
 */
export class MemoryIndexer {
  constructor(private readonly embeddingService: EmbeddingService) {}

  async indexJournal(entry: {
    id: string
    entryDate: string
    mood: string
    reflection?: string | null
    wins?: string | null
    challenges?: string | null
  }): Promise<void> {
    const text = [
      entry.reflection,
      entry.wins && `Wins: ${entry.wins}`,
      entry.challenges && `Challenges: ${entry.challenges}`,
    ]
      .filter(Boolean)
      .join('\n')

    if (!text.trim()) return

    await this.embeddingService.store({
      id: `journal:${entry.id}`,
      category: 'journal',
      title: `Journal — ${entry.entryDate} (${entry.mood})`,
      text,
      importance: moodToImportance(entry.mood),
      createdAt: entry.entryDate,
      sourceId: entry.id,
    })
  }

  async indexTask(task: {
    id: string
    title: string
    description?: string | null
    completed: boolean
    createdAt: string
  }): Promise<void> {
    if (!task.completed) return

    await this.embeddingService.store({
      id: `task:${task.id}`,
      category: 'task',
      title: `Completed: ${task.title}`,
      text: task.description?.trim() || task.title,
      importance: 4,
      createdAt: task.createdAt,
      sourceId: task.id,
    })
  }

  async indexGoal(goal: {
    id: string
    title: string
    description?: string | null
    progress: number
    createdAt: string
  }): Promise<void> {
    await this.embeddingService.store({
      id: `goal:${goal.id}`,
      category: 'goal',
      title: goal.title,
      text: [goal.description, `Progress: ${goal.progress}%`].filter(Boolean).join('\n'),
      importance: Math.min(10, 5 + Math.round(goal.progress / 20)),
      createdAt: goal.createdAt,
      sourceId: goal.id,
    })
  }

  async indexTrainingSession(session: {
    id: string
    sessionDate: string
    notes?: string | null
    positionPlayed: string
    intensity: number
  }): Promise<void> {
    const text =
      session.notes?.trim() ||
      `Training session — ${session.positionPlayed}, intensity ${session.intensity}/10`

    await this.embeddingService.store({
      id: `training:${session.id}`,
      category: 'soccer_training',
      title: `Training ${session.sessionDate}`,
      text,
      importance: Math.min(10, 4 + Math.round(session.intensity / 2)),
      createdAt: session.sessionDate,
      sourceId: session.id,
    })
  }

  async indexRunLog(run: {
    id: string
    runDate: string
    distanceLabel: string
    durationSec: number
    notes?: string | null
  }): Promise<void> {
    const minutes = Math.floor(run.durationSec / 60)
    const seconds = run.durationSec % 60
    const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`

    await this.embeddingService.store({
      id: `run:${run.id}`,
      category: 'soccer_training',
      title: `Run — ${run.distanceLabel} in ${timeStr}`,
      text: [run.notes, `Distance: ${run.distanceLabel}`, `Time: ${timeStr}`].filter(Boolean).join('\n'),
      importance: 6,
      createdAt: run.runDate,
      sourceId: run.id,
    })
  }

  async indexMatchReport(report: {
    id: string
    matchDate: string
    opponent: string
    result?: string | null
    notes?: string | null
    rating?: number | null
  }): Promise<void> {
    const text = [
      report.result && `Result: ${report.result}`,
      report.notes,
      report.rating != null && `Self rating: ${report.rating}/10`,
    ]
      .filter(Boolean)
      .join('\n')

    if (!text.trim()) return

    await this.embeddingService.store({
      id: `match:${report.id}`,
      category: 'match_report',
      title: `Match vs ${report.opponent} (${report.matchDate})`,
      text,
      importance: report.rating != null ? Math.min(10, report.rating) : 7,
      createdAt: report.matchDate,
      sourceId: report.id,
    })
  }

  async indexCollegeApplication(college: {
    id: string
    name: string
    notes?: string | null
    status?: string | null
    createdAt: string
  }): Promise<void> {
    await this.embeddingService.store({
      id: `college:${college.id}`,
      category: 'college_application',
      title: college.name,
      text: [college.status && `Status: ${college.status}`, college.notes].filter(Boolean).join('\n'),
      importance: 8,
      createdAt: college.createdAt,
      sourceId: college.id,
    })
  }

  async indexActivity(activity: {
    id: string
    name: string
    description?: string | null
    role?: string | null
    createdAt: string
  }): Promise<void> {
    await this.embeddingService.store({
      id: `activity:${activity.id}`,
      category: 'activity',
      title: activity.name,
      text: [activity.role && `Role: ${activity.role}`, activity.description].filter(Boolean).join('\n'),
      importance: 6,
      createdAt: activity.createdAt,
      sourceId: activity.id,
    })
  }

  async indexProject(project: {
    id: string
    title: string
    description?: string | null
    createdAt: string
  }): Promise<void> {
    await this.embeddingService.store({
      id: `project:${project.id}`,
      category: 'project',
      title: project.title,
      text: project.description?.trim() || project.title,
      importance: 7,
      createdAt: project.createdAt,
      sourceId: project.id,
    })
  }

  async indexDocument(doc: {
    id: string
    filename: string
    excerpt: string
    createdAt: string
    importance?: number
  }): Promise<void> {
    await this.embeddingService.store({
      id: `doc:${doc.id}`,
      category: 'document',
      title: doc.filename,
      text: doc.excerpt,
      importance: doc.importance ?? 6,
      createdAt: doc.createdAt,
      sourceId: doc.id,
    })
  }

  async indexUserNote(note: { id?: string; title: string; text: string; importance?: number }): Promise<void> {
    const input: CreateMemoryInput = {
      id: note.id ? `note:${note.id}` : undefined,
      category: 'user_note',
      title: note.title,
      text: note.text,
      importance: note.importance ?? 6,
    }
    await this.embeddingService.store(input)
  }

  async indexAiSummary(summary: {
    id: string
    title: string
    text: string
    importance?: number
    createdAt?: string
  }): Promise<void> {
    await this.embeddingService.store({
      id: `ai:${summary.id}`,
      category: 'ai_summary',
      title: summary.title,
      text: summary.text,
      importance: summary.importance ?? 7,
      createdAt: summary.createdAt,
      sourceId: summary.id,
    })
  }
}

function moodToImportance(mood: string): number {
  const map: Record<string, number> = {
    great: 8,
    good: 6,
    okay: 5,
    low: 7,
    rough: 9,
  }
  return map[mood] ?? 5
}
