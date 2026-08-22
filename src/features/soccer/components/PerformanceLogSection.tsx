import { useMemo, useState } from 'react'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { IconPlus } from '@components/ui/icons'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { deleteError, updateError } from '@lib/userFacingError'
import { MatchLogForm } from '../matches/components/MatchLogForm'
import { useSoccerMatches } from '../matches/hooks/useSoccerMatches'
import type { CreateSoccerMatchInput, SoccerMatch } from '../matches/types'
import { RESULT_LABELS } from '../matches/types'
import { TrainingSessionForm } from '../training/components/TrainingSessionForm'
import { useTrainingSessions } from '../training/hooks/useTrainingSessions'
import type { CreateTrainingSessionInput, TrainingSession } from '../training/types'
import { useAthleteDevelopment } from '../hooks/useAthleteDevelopment'
import { resolveSessionSkillsDisplay } from '../training/components/SkillChecklist'
import { cn } from '@lib/utils'
import { formatMinutesDuration } from '@lib/formatDuration'
import { formatShortDate } from '../utils'

interface PerformanceLogSectionProps {
  className?: string
  compact?: boolean
}

type LogEntry =
  | { kind: 'session'; date: string; session: TrainingSession }
  | { kind: 'game'; date: string; match: SoccerMatch }

export function PerformanceLogSection({ className, compact = false }: PerformanceLogSectionProps) {
  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    createSession,
    updateSession,
    deleteSession,
    reload: reloadSessions,
  } = useTrainingSessions()

  const {
    matches,
    loading: matchesLoading,
    error: matchesError,
    createMatch,
    updateMatch,
    deleteMatch,
    reload: reloadMatches,
  } = useSoccerMatches()

  const { development } = useAthleteDevelopment()
  const skills = development.skills

  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null)
  const [gameModalOpen, setGameModalOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState<SoccerMatch | null>(null)

  const loading = sessionsLoading || matchesLoading
  const entries = useMemo<LogEntry[]>(() => {
    const combined: LogEntry[] = [
      ...sessions.map((session) => ({ kind: 'session' as const, date: session.session_date, session })),
      ...matches.map((match) => ({ kind: 'game' as const, date: match.match_date, match })),
    ]
    return combined.sort((a, b) => b.date.localeCompare(a.date) || b.kind.localeCompare(a.kind))
  }, [sessions, matches])

  function openCreateSession() {
    setEditingSession(null)
    setSessionModalOpen(true)
  }

  function openEditSession(session: TrainingSession) {
    setEditingSession(session)
    setSessionModalOpen(true)
  }

  function closeSessionModal() {
    setSessionModalOpen(false)
    setEditingSession(null)
  }

  function openCreateGame() {
    setEditingMatch(null)
    setGameModalOpen(true)
  }

  function openEditGame(match: SoccerMatch) {
    setEditingMatch(match)
    setGameModalOpen(true)
  }

  function closeGameModal() {
    setGameModalOpen(false)
    setEditingMatch(null)
  }

  async function handleDeleteSession(id: string) {
    if (!confirm('Delete this training session?')) return
    try {
      await deleteSession(id)
    } catch (err) {
      alert(deleteError('this session', err))
    }
  }

  async function handleDeleteGame(id: string) {
    if (!confirm('Delete this game?')) return
    try {
      await deleteMatch(id)
    } catch (err) {
      alert(deleteError('this game', err))
    }
  }

  async function handleSessionSubmit(input: CreateTrainingSessionInput) {
    if (editingSession) await updateSession(editingSession.id, input)
    else await createSession(input)
    closeSessionModal()
  }

  async function clearLegacySessionLabel(session: TrainingSession) {
    try {
      await updateSession(session.id, { tab_category: null, skills_trained: [] })
    } catch (err) {
      alert(updateError('this label', err))
    }
  }

  async function handleGameSubmit(input: CreateSoccerMatchInput) {
    if (editingMatch) await updateMatch(editingMatch.id, input)
    else await createMatch(input)
    closeGameModal()
  }

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      {(sessionsError || matchesError) && (
        <div className="mb-2 rounded-[var(--radius-sm)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-2">
          <p className="text-xs text-[var(--color-danger)]">{sessionsError ?? matchesError}</p>
          <div className="mt-2 flex gap-2">
            {sessionsError && (
              <Button variant="secondary" size="sm" onClick={() => void reloadSessions()}>
                Retry sessions
              </Button>
            )}
            {matchesError && (
              <Button variant="secondary" size="sm" onClick={() => void reloadMatches()}>
                Retry games
              </Button>
            )}
          </div>
        </div>
      )}

      <Panel
        title="Session log"
        subtitle={
          loading
            ? 'Loading…'
            : `${sessions.length} session${sessions.length === 1 ? '' : 's'} · ${matches.length} game${matches.length === 1 ? '' : 's'}`
        }
        fillHeight={compact}
        scrollCap={compact}
        className={cn(compact && 'min-h-0 flex-1')}
        action={
          <div className="flex shrink-0 items-center gap-2">
            <PanelActionLink onClick={openCreateSession} className="inline-flex items-center gap-1">
              <IconPlus width={14} height={14} />
              Session
            </PanelActionLink>
            <PanelActionLink onClick={openCreateGame} className="inline-flex items-center gap-1">
              <IconPlus width={14} height={14} />
              Game
            </PanelActionLink>
          </div>
        }
      >
        {loading ? (
          <p className="text-xs text-[var(--color-text-tertiary)]">Loading log…</p>
        ) : entries.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-xs text-[var(--color-text-secondary)]">No sessions or games yet.</p>
            <div className="mt-2 flex justify-center gap-2">
              <Button size="sm" onClick={openCreateSession}>
                Log session
              </Button>
              <Button size="sm" variant="secondary" onClick={openCreateGame}>
                Log game
              </Button>
            </div>
          </div>
        ) : compact ? (
          <ul className="space-y-1">
            {entries.map((entry) =>
              entry.kind === 'session' ? (
                (() => {
                  const display = resolveSessionSkillsDisplay(entry.session, skills)
                  return (
                <li
                  key={`session-${entry.session.id}`}
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1.5 text-xs"
                >
                  <div className="min-w-0 truncate text-[var(--color-text-secondary)]">
                    <span className="font-medium text-[var(--color-accent-muted)]">Session</span>
                    {' · '}
                    <span
                      className={cn(
                        'font-medium',
                        display.orphaned
                          ? 'text-[var(--color-warning)]'
                          : 'text-[var(--color-text-primary)]',
                      )}
                    >
                      {display.label}
                    </span>
                    {' · '}
                    {formatMinutesDuration(entry.session.duration_min)} · {entry.session.intensity}/10 ·{' '}
                    {formatShortDate(entry.session.session_date)}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {display.orphaned && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 min-h-10 px-3 text-xs text-[var(--color-warning)]"
                        onClick={() => void clearLegacySessionLabel(entry.session)}
                      >
                        Clear
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 min-h-10 px-3 text-xs"
                      onClick={() => openEditSession(entry.session)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 min-h-10 px-3 text-xs"
                      onClick={() => void handleDeleteSession(entry.session.id)}
                    >
                      Del
                    </Button>
                  </div>
                </li>
                  )
                })()
              ) : (
                <li
                  key={`game-${entry.match.id}`}
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1.5 text-xs"
                >
                  <div className="min-w-0 truncate text-[var(--color-text-secondary)]">
                    <span className="font-medium text-[var(--color-warning)]">Game</span>
                    {' · '}
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {entry.match.competition ?? 'Game'}
                    </span>
                    {' · '}
                    {RESULT_LABELS[entry.match.result]} · {formatShortDate(entry.match.match_date)}
                    {entry.match.opponent !== 'Self-reported' && ` · vs ${entry.match.opponent}`}
                    {(entry.match.goals > 0 || entry.match.assists > 0) &&
                      ` · ${entry.match.goals}G ${entry.match.assists}A`}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 min-h-10 px-3 text-xs"
                      onClick={() => openEditGame(entry.match)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 min-h-10 px-3 text-xs"
                      onClick={() => void handleDeleteGame(entry.match.id)}
                    >
                      Del
                    </Button>
                  </div>
                </li>
              ),
            )}
          </ul>
        ) : (
          <p className="text-xs text-[var(--color-text-tertiary)]">Use compact layout on overview.</p>
        )}
      </Panel>

      <Modal
        open={sessionModalOpen}
        onClose={closeSessionModal}
        title={editingSession ? 'Edit session' : 'Log training session'}
      >
        <TrainingSessionForm
          key={editingSession?.id ?? 'new'}
          session={editingSession}
          onSubmit={handleSessionSubmit}
          onCancel={closeSessionModal}
        />
      </Modal>

      <Modal open={gameModalOpen} onClose={closeGameModal} title={editingMatch ? 'Edit game' : 'Log a game'}>
        <MatchLogForm
          key={editingMatch?.id ?? 'new'}
          match={editingMatch}
          onSubmit={handleGameSubmit}
          onCancel={closeGameModal}
        />
      </Modal>
    </div>
  )
}
