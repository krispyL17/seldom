import { Button } from '@components/ui/Button'
import { Panel, PanelDivider } from '@components/ui/Panel'
import { Input } from '@components/ui/Input'
import { Textarea } from '@components/ui/Textarea'
import { Badge } from '@components/ui/Badge'
import { EmptyState } from '@components/ui/EmptyState'
import { useCollege } from '../../hooks/useCollege'
import type {
  CommonAppData,
  EssayDraftStatus,
  EssayIdea,
  PersonalStatementDraft,
  ReflectionNote,
  SupplementalEntry,
} from '../../types'
import { countWords, essayStatusLabel, generateId } from '../../utils'

const DRAFT_STATUSES: EssayDraftStatus[] = [
  'not_started',
  'outline',
  'draft',
  'revision',
  'final',
]

export function EssaysWorkspaceTab() {
  const { colleges, userData, updateCommonApp, isSeniorMode } = useCollege()
  const commonApp = userData?.commonApp
  if (!commonApp) return null

  async function save(next: CommonAppData) {
    await updateCommonApp(next)
  }

  const collegeEssays = colleges.flatMap((c) =>
    c.essays.map((e) => ({ ...e, collegeName: c.name })),
  )

  const themeCount = commonApp.essayIdeas.length + commonApp.reflectionNotes.length
  const draftCount = commonApp.personalStatementDrafts.length + commonApp.supplementalTracking.length
  const totalCount = themeCount + draftCount + collegeEssays.length

  return (
    <Panel
      fillHeight
      title="Essays"
      subtitle={
        isSeniorMode
          ? `${totalCount} items tracked`
          : `${themeCount} themes · ${collegeEssays.length} school prompts`
      }
    >
      <div className="college-scroll-region space-y-5">
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
              Essay themes
            </h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                void save({
                  ...commonApp,
                  essayIdeas: [
                    ...commonApp.essayIdeas,
                    {
                      id: generateId(),
                      title: 'New essay theme',
                      prompt: '',
                      notes: '',
                      linkedActivityIds: [],
                    } satisfies EssayIdea,
                  ],
                })
              }
            >
              + Theme
            </Button>
          </div>
          {commonApp.essayIdeas.length === 0 ? (
            <p className="text-xs text-[var(--color-text-tertiary)]">No themes yet.</p>
          ) : (
            <ul className="space-y-2">
              {commonApp.essayIdeas.map((idea) => (
                <li
                  key={idea.id}
                  className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Input
                        label="Title"
                        value={idea.title}
                        onChange={(e) => {
                          const essayIdeas = commonApp.essayIdeas.map((i) =>
                            i.id === idea.id ? { ...i, title: e.target.value } : i,
                          )
                          void save({ ...commonApp, essayIdeas })
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void save({
                          ...commonApp,
                          essayIdeas: commonApp.essayIdeas.filter((i) => i.id !== idea.id),
                        })
                      }
                      className="mt-5 shrink-0 text-xs text-[var(--color-danger)] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2">
                    <Textarea
                      label="Notes"
                      value={idea.notes}
                      onChange={(e) => {
                        const essayIdeas = commonApp.essayIdeas.map((i) =>
                          i.id === idea.id ? { ...i, notes: e.target.value } : i,
                        )
                        void save({ ...commonApp, essayIdeas })
                      }}
                      rows={2}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <PanelDivider label="Reflection notes" />

        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Story angles for essays and interviews
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const note: ReflectionNote = {
                  id: generateId(),
                  title: 'New reflection',
                  content: '',
                  tags: [],
                  createdAt: new Date().toISOString(),
                }
                void save({ ...commonApp, reflectionNotes: [...commonApp.reflectionNotes, note] })
              }}
            >
              + Note
            </Button>
          </div>
          {commonApp.reflectionNotes.length === 0 ? (
            <p className="text-xs text-[var(--color-text-tertiary)]">No reflection notes yet.</p>
          ) : (
            <ul className="space-y-2">
              {commonApp.reflectionNotes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Input
                        label="Title"
                        value={note.title}
                        onChange={(e) => {
                          const reflectionNotes = commonApp.reflectionNotes.map((n) =>
                            n.id === note.id ? { ...n, title: e.target.value } : n,
                          )
                          void save({ ...commonApp, reflectionNotes })
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void save({
                          ...commonApp,
                          reflectionNotes: commonApp.reflectionNotes.filter((n) => n.id !== note.id),
                        })
                      }
                      className="mt-5 shrink-0 text-xs text-[var(--color-danger)] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2">
                    <Textarea
                      label="Content"
                      value={note.content}
                      onChange={(e) => {
                        const reflectionNotes = commonApp.reflectionNotes.map((n) =>
                          n.id === note.id ? { ...n, content: e.target.value } : n,
                        )
                        void save({ ...commonApp, reflectionNotes })
                      }}
                      rows={3}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isSeniorMode && (
          <>
            <PanelDivider label="Personal statement" />
            <section>
              <div className="mb-2 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const draft: PersonalStatementDraft = {
                      id: generateId(),
                      title: 'Draft',
                      content: '',
                      wordCount: 0,
                      status: 'outline',
                      updatedAt: new Date().toISOString(),
                    }
                    void save({
                      ...commonApp,
                      personalStatementDrafts: [...commonApp.personalStatementDrafts, draft],
                    })
                  }}
                >
                  + Draft
                </Button>
              </div>
              {commonApp.personalStatementDrafts.length === 0 ? (
                <EmptyState title="No drafts yet" description="Start your personal statement here." />
              ) : (
                <ul className="space-y-3">
                  {commonApp.personalStatementDrafts.map((draft) => (
                    <li
                      key={draft.id}
                      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3"
                    >
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Input
                            label="Title"
                            value={draft.title}
                            onChange={(e) => {
                              const personalStatementDrafts = commonApp.personalStatementDrafts.map((d) =>
                                d.id === draft.id ? { ...d, title: e.target.value } : d,
                              )
                              void save({ ...commonApp, personalStatementDrafts })
                            }}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <label className="block text-xs font-medium text-[var(--color-text-tertiary)]">
                            Status
                            <select
                              value={draft.status}
                              onChange={(e) => {
                                const personalStatementDrafts = commonApp.personalStatementDrafts.map((d) =>
                                  d.id === draft.id
                                    ? { ...d, status: e.target.value as EssayDraftStatus }
                                    : d,
                                )
                                void save({ ...commonApp, personalStatementDrafts })
                              }}
                              className="mt-1 block rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1 text-xs"
                            >
                              {DRAFT_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {essayStatusLabel(s)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              void save({
                                ...commonApp,
                                personalStatementDrafts: commonApp.personalStatementDrafts.filter(
                                  (d) => d.id !== draft.id,
                                ),
                              })
                            }
                            className="pb-1 text-xs text-[var(--color-danger)] hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <Textarea
                        label="Content"
                        value={draft.content}
                        onChange={(e) => {
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
                          void save({ ...commonApp, personalStatementDrafts })
                        }}
                        rows={5}
                      />
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {draft.wordCount} words
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <PanelDivider label="Supplementals" />
            <section>
              <div className="mb-2 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
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
                    void save({
                      ...commonApp,
                      supplementalTracking: [...commonApp.supplementalTracking, entry],
                    })
                  }}
                >
                  + Supplemental
                </Button>
              </div>
              {commonApp.supplementalTracking.length === 0 ? (
                <p className="text-xs text-[var(--color-text-tertiary)]">No supplementals tracked yet.</p>
              ) : (
                <ul className="space-y-2">
                  {commonApp.supplementalTracking.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-[var(--color-text-primary)]">
                          {entry.collegeName}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            void save({
                              ...commonApp,
                              supplementalTracking: commonApp.supplementalTracking.filter(
                                (s) => s.id !== entry.id,
                              ),
                            })
                          }
                          className="text-xs text-[var(--color-danger)] hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <Textarea
                        label="Prompt"
                        value={entry.prompt}
                        onChange={(e) => {
                          const supplementalTracking = commonApp.supplementalTracking.map((s) =>
                            s.id === entry.id ? { ...s, prompt: e.target.value } : s,
                          )
                          void save({ ...commonApp, supplementalTracking })
                        }}
                        rows={2}
                      />
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="default">{essayStatusLabel(entry.status)}</Badge>
                        <label className="text-xs text-[var(--color-text-tertiary)]">
                          Status
                          <select
                            value={entry.status}
                            onChange={(e) => {
                              const supplementalTracking = commonApp.supplementalTracking.map((s) =>
                                s.id === entry.id
                                  ? { ...s, status: e.target.value as EssayDraftStatus }
                                  : s,
                              )
                              void save({ ...commonApp, supplementalTracking })
                            }}
                            className="ml-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-0.5 text-xs"
                          >
                            {DRAFT_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {essayStatusLabel(s)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {collegeEssays.length > 0 && (
          <>
            <PanelDivider label="School essays" />
            <ul className="space-y-2">
              {collegeEssays.map((essay) => (
                <li
                  key={essay.id}
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2 text-xs"
                >
                  <span className="truncate text-[var(--color-text-secondary)]">
                    {essay.collegeName}: {essay.prompt.slice(0, 60)}
                    {essay.prompt.length > 60 ? '…' : ''}
                  </span>
                  <Badge variant="default">{essayStatusLabel(essay.status)}</Badge>
                </li>
              ))}
            </ul>
          </>
        )}

        <PanelDivider label="Recommendations" />
        <RecommendationsSection />
      </div>
    </Panel>
  )
}

const REC_STATUS_LABELS = {
  not_requested: 'Not requested',
  requested: 'Requested',
  submitted: 'Submitted',
} as const

function RecommendationsSection() {
  const { userData, colleges, isSeniorMode } = useCollege()
  const recommendations = userData?.recommendations ?? []

  if (recommendations.length === 0) {
    return <p className="text-xs text-[var(--color-text-tertiary)]">No recommenders tracked.</p>
  }

  return (
    <ul className="space-y-2">
      {recommendations.map((rec) => {
        const collegeNames = rec.collegeIds
          .map((id) => colleges.find((c) => c.id === id)?.name)
          .filter(Boolean)
        return (
          <li
            key={rec.id}
            className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[var(--color-text-primary)]">{rec.recommender}</p>
              <Badge
                variant={
                  rec.status === 'submitted'
                    ? 'success'
                    : rec.status === 'requested'
                      ? 'warning'
                      : 'muted'
                }
              >
                {isSeniorMode
                  ? REC_STATUS_LABELS[rec.status]
                  : rec.status === 'not_requested'
                    ? 'Building'
                    : 'Connected'}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs capitalize text-[var(--color-text-tertiary)]">{rec.role}</p>
            {isSeniorMode && collegeNames.length > 0 && (
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                {collegeNames.join(', ')}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
