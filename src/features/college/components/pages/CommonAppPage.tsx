import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { Input } from '@components/ui/Input'
import { Textarea } from '@components/ui/Textarea'
import { Badge } from '@components/ui/Badge'
import { PreviewBadge } from '../shared/PreviewBadge'
import { SeniorModePrompt } from '../shared/SeniorModePrompt'
import { useCollege } from '../../hooks/useCollege'
import type {
  ActivityDescription,
  CommonAppData,
  EssayIdea,
  PersonalStatementDraft,
  ReflectionNote,
  SupplementalEntry,
} from '../../types'
import { countWords, essayStatusLabel, generateId } from '../../utils'

type Tab =
  | 'activity-descriptions'
  | 'essay-ideas'
  | 'personal-statement'
  | 'supplementals'
  | 'reflections'

const JUNIOR_TABS: { id: Tab; label: string }[] = [
  { id: 'activity-descriptions', label: 'Activity Descriptions' },
  { id: 'essay-ideas', label: 'Essay Ideas' },
  { id: 'reflections', label: 'Reflection Notes' },
]

const SENIOR_TABS: { id: Tab; label: string }[] = [
  { id: 'activity-descriptions', label: 'Activity Descriptions' },
  { id: 'essay-ideas', label: 'Essay Ideas' },
  { id: 'personal-statement', label: 'Personal Statement' },
  { id: 'supplementals', label: 'Supplemental Tracking' },
  { id: 'reflections', label: 'Reflection Notes' },
]

export function CommonAppPage() {
  const { activities, colleges, userData, updateCommonApp, isSeniorMode } = useCollege()
  const [tab, setTab] = useState<Tab>('activity-descriptions')
  const commonApp = userData?.commonApp
  const tabs = isSeniorMode ? SENIOR_TABS : JUNIOR_TABS

  if (!commonApp) return null

  async function save(next: CommonAppData) {
    await updateCommonApp(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {isSeniorMode
            ? 'Common Application support — structured for AI assistant access later'
            : 'Essay & activity prep — brainstorm before application season'}
        </p>
        <PreviewBadge />
      </div>

      {!isSeniorMode && <SeniorModePrompt variant="card" />}

      <div className="flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? 'rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white'
                : 'rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-overlay)]'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'activity-descriptions' && (
        <Panel title="Activity Descriptions" subtitle="150-character Common App versions">
          <ul className="space-y-4">
            {activities.map((activity) => {
              const existing = commonApp.activityDescriptions.find((d) => d.activityId === activity.id)
              return (
                <li key={activity.id}>
                  <ActivityDescriptionEditor
                    activityName={activity.name}
                    description={existing}
                    onSave={async (text) => {
                      const descriptions = [...commonApp.activityDescriptions]
                      const idx = descriptions.findIndex((d) => d.activityId === activity.id)
                      const entry: ActivityDescription = {
                        id: existing?.id ?? generateId(),
                        activityId: activity.id,
                        commonAppText: text,
                        characterCount: text.length,
                        updatedAt: new Date().toISOString(),
                      }
                      if (idx >= 0) descriptions[idx] = entry
                      else descriptions.push(entry)
                      await save({ ...commonApp, activityDescriptions: descriptions })
                    }}
                  />
                </li>
              )
            })}
          </ul>
        </Panel>
      )}

      {tab === 'essay-ideas' && (
        <Panel
          title="Essay Ideas"
          subtitle={`${commonApp.essayIdeas.length} brainstormed`}
          action={
            <Button
              size="sm"
              onClick={async () => {
                const idea: EssayIdea = {
                  id: generateId(),
                  title: 'New essay idea',
                  prompt: '',
                  notes: '',
                  linkedActivityIds: [],
                }
                await save({ ...commonApp, essayIdeas: [...commonApp.essayIdeas, idea] })
              }}
            >
              + Add idea
            </Button>
          }
        >
          <ul className="space-y-3">
            {commonApp.essayIdeas.map((idea) => (
              <li key={idea.id} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                <Input
                  label="Title"
                  value={idea.title}
                  onChange={async (e) => {
                    const essayIdeas = commonApp.essayIdeas.map((i) =>
                      i.id === idea.id ? { ...i, title: e.target.value } : i,
                    )
                    await save({ ...commonApp, essayIdeas })
                  }}
                />
                <div className="mt-2">
                  <Textarea
                    label="Notes"
                    value={idea.notes}
                    onChange={async (e) => {
                      const essayIdeas = commonApp.essayIdeas.map((i) =>
                        i.id === idea.id ? { ...i, notes: e.target.value } : i,
                      )
                      await save({ ...commonApp, essayIdeas })
                    }}
                    rows={3}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === 'personal-statement' && isSeniorMode && (
        <Panel
          title="Personal Statement Drafts"
          subtitle={`${commonApp.personalStatementDrafts.length} drafts`}
          action={
            <Button
              size="sm"
              onClick={async () => {
                const draft: PersonalStatementDraft = {
                  id: generateId(),
                  title: 'Draft',
                  content: '',
                  wordCount: 0,
                  status: 'outline',
                  updatedAt: new Date().toISOString(),
                }
                await save({
                  ...commonApp,
                  personalStatementDrafts: [...commonApp.personalStatementDrafts, draft],
                })
              }}
            >
              + New draft
            </Button>
          }
        >
          <ul className="space-y-4">
            {commonApp.personalStatementDrafts.map((draft) => (
              <li key={draft.id} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Input
                    label="Title"
                    value={draft.title}
                    onChange={async (e) => {
                      const personalStatementDrafts = commonApp.personalStatementDrafts.map((d) =>
                        d.id === draft.id ? { ...d, title: e.target.value } : d,
                      )
                      await save({ ...commonApp, personalStatementDrafts })
                    }}
                  />
                  <Badge variant="accent">{essayStatusLabel(draft.status)}</Badge>
                </div>
                <Textarea
                  label="Content"
                  value={draft.content}
                  onChange={async (e) => {
                    const content = e.target.value
                    const personalStatementDrafts = commonApp.personalStatementDrafts.map((d) =>
                      d.id === draft.id
                        ? {
                            ...d,
                            content,
                            wordCount: countWords(content),
                            updatedAt: new Date().toISOString(),
                          }
                        : d,
                    )
                    await save({ ...commonApp, personalStatementDrafts })
                  }}
                  rows={6}
                />
                <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">
                  {draft.wordCount} words
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === 'supplementals' && isSeniorMode && (
        <Panel
          title="Supplemental Essay Tracking"
          subtitle="Per-college prompts"
          action={
            <Button
              size="sm"
              onClick={async () => {
                const college = colleges[0]
                const entry: SupplementalEntry = {
                  id: generateId(),
                  collegeId: college?.id ?? '',
                  collegeName: college?.name ?? 'College',
                  prompt: '',
                  status: 'not_started',
                  wordCount: 0,
                  maxWords: 250,
                  notes: '',
                }
                await save({
                  ...commonApp,
                  supplementalTracking: [...commonApp.supplementalTracking, entry],
                })
              }}
            >
              + Add supplemental
            </Button>
          }
        >
          <ul className="space-y-3">
            {commonApp.supplementalTracking.map((entry) => (
              <li key={entry.id} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                <p className="text-xs font-medium text-[var(--color-text-primary)]">{entry.collegeName}</p>
                <Textarea
                  label="Prompt"
                  value={entry.prompt}
                  onChange={async (e) => {
                    const supplementalTracking = commonApp.supplementalTracking.map((s) =>
                      s.id === entry.id ? { ...s, prompt: e.target.value } : s,
                    )
                    await save({ ...commonApp, supplementalTracking })
                  }}
                  rows={2}
                />
                <Badge variant="default">{essayStatusLabel(entry.status)}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === 'reflections' && (
        <Panel
          title="Reflection Notes"
          subtitle="Ideas for essays & interviews"
          action={
            <Button
              size="sm"
              onClick={async () => {
                const note: ReflectionNote = {
                  id: generateId(),
                  title: 'New reflection',
                  content: '',
                  tags: [],
                  createdAt: new Date().toISOString(),
                }
                await save({ ...commonApp, reflectionNotes: [...commonApp.reflectionNotes, note] })
              }}
            >
              + Add note
            </Button>
          }
        >
          <ul className="space-y-3">
            {commonApp.reflectionNotes.map((note) => (
              <li key={note.id} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                <Input
                  label="Title"
                  value={note.title}
                  onChange={async (e) => {
                    const reflectionNotes = commonApp.reflectionNotes.map((n) =>
                      n.id === note.id ? { ...n, title: e.target.value } : n,
                    )
                    await save({ ...commonApp, reflectionNotes })
                  }}
                />
                <div className="mt-2">
                  <Textarea
                    label="Content"
                    value={note.content}
                    onChange={async (e) => {
                      const reflectionNotes = commonApp.reflectionNotes.map((n) =>
                        n.id === note.id ? { ...n, content: e.target.value } : n,
                      )
                      await save({ ...commonApp, reflectionNotes })
                    }}
                    rows={4}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}

function ActivityDescriptionEditor({
  activityName,
  description,
  onSave,
}: {
  activityName: string
  description?: ActivityDescription
  onSave: (text: string) => Promise<void>
}) {
  const [text, setText] = useState(description?.commonAppText ?? '')

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-[var(--color-text-primary)]">{activityName}</p>
      <Textarea
        label="Common App description"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 150))}
        rows={2}
        placeholder="150-character Common App description…"
      />
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-[var(--color-text-tertiary)]">{text.length}/150</span>
        <Button size="sm" variant="secondary" onClick={() => onSave(text)}>
          Save
        </Button>
      </div>
    </div>
  )
}
