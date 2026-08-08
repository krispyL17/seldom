import { Panel } from '@components/ui/Panel'
import { Badge } from '@components/ui/Badge'
import { useCollege } from '../../hooks/useCollege'
import { essayStatusLabel } from '../../utils'

export function EssaysProgressPanel() {
  const { colleges, userData, isSeniorMode } = useCollege()
  const collegeEssays = colleges.flatMap((c) =>
    c.essays.map((e) => ({ ...e, collegeName: c.name })),
  )
  const personalDrafts = userData?.commonApp.personalStatementDrafts ?? []
  const supplementals = userData?.commonApp.supplementalTracking ?? []
  const essayIdeas = userData?.commonApp.essayIdeas ?? []

  const total = isSeniorMode
    ? collegeEssays.length + personalDrafts.length + supplementals.length
    : collegeEssays.length + essayIdeas.length + personalDrafts.length

  const inProgress = isSeniorMode
    ? collegeEssays.filter((e) => e.status !== 'final' && e.status !== 'not_started').length +
      personalDrafts.filter((e) => e.status !== 'final' && e.status !== 'not_started').length +
      supplementals.filter((e) => e.status !== 'final' && e.status !== 'not_started').length
    : collegeEssays.filter((e) => e.status !== 'final' && e.status !== 'not_started').length +
      essayIdeas.length

  return (
    <Panel
      title={isSeniorMode ? 'Essays in Progress' : 'Essay & Theme Prep'}
      subtitle={`${inProgress} active of ${total} total`}
    >
      {total === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {isSeniorMode ? 'No essays tracked yet.' : 'Start brainstorming in Common App → Essays.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {!isSeniorMode &&
            essayIdeas.slice(0, 3).map((idea) => (
              <li key={idea.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-[var(--color-text-primary)]">{idea.title}</span>
                <Badge variant="muted">Idea</Badge>
              </li>
            ))}
          {isSeniorMode &&
            personalDrafts.slice(0, 2).map((draft) => (
              <li key={draft.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-[var(--color-text-primary)]">{draft.title}</span>
                <Badge variant="accent">{essayStatusLabel(draft.status)}</Badge>
              </li>
            ))}
          {collegeEssays.slice(0, 4).map((essay) => (
            <li key={essay.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-[var(--color-text-secondary)]">
                {essay.collegeName}: {essay.prompt.slice(0, 40)}…
              </span>
              <Badge variant="default">{essayStatusLabel(essay.status)}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
