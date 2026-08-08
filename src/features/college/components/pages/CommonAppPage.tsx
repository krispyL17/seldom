import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { Textarea } from '@components/ui/Textarea'
import { PreviewBadge } from '../shared/PreviewBadge'
import { EssaysWorkspaceTab } from '../common-app/EssaysWorkspaceTab'
import { ExperienceWorkspacePanel, type ExperienceTab } from '../common-app/ExperienceWorkspace'
import { useCollege } from '../../hooks/useCollege'
import { CollegePageShell } from '../CollegePageShell'
import { cn } from '@lib/utils'
import type { ActivityDescription, CommonAppData } from '../../types'
import { generateId } from '../../utils'

type Tab = ExperienceTab | 'descriptions' | 'essays'

const TABS: { id: Tab; label: string }[] = [
  { id: 'activities', label: 'Activities' },
  { id: 'awards', label: 'Awards' },
  { id: 'projects', label: 'Projects' },
  { id: 'descriptions', label: 'App Descriptions' },
  { id: 'essays', label: 'Essays' },
  { id: 'resume', label: 'Résumé' },
]

const LEGACY_TAB_MAP: Record<string, Tab> = {
  activities: 'activities',
  awards: 'awards',
  projects: 'projects',
  resume: 'resume',
  essays: 'essays',
  'activity-descriptions': 'descriptions',
  descriptions: 'descriptions',
  'essay-ideas': 'essays',
  reflections: 'essays',
  'personal-statement': 'essays',
  supplementals: 'essays',
}

function parseTab(value: string | null): Tab {
  if (value && LEGACY_TAB_MAP[value]) return LEGACY_TAB_MAP[value]
  return 'activities'
}

export function CommonAppPage() {
  const { activities, userData, updateCommonApp, isSeniorMode } = useCollege()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(() => parseTab(searchParams.get('tab')))
  const commonApp = userData?.commonApp

  useEffect(() => {
    setTab(parseTab(searchParams.get('tab')))
  }, [searchParams])

  function selectTab(next: Tab) {
    setTab(next)
    setSearchParams({ tab: next }, { replace: true })
  }

  if (!commonApp) return null

  async function save(next: CommonAppData) {
    await updateCommonApp(next)
  }

  const tabClass = (active: boolean) =>
    cn(
      'rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors',
      active
        ? 'bg-[var(--color-accent)] text-white'
        : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-overlay)]',
    )

  return (
    <CollegePageShell>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <p className="text-[10px] text-[var(--color-text-tertiary)]">
          {isSeniorMode
            ? 'Activities, essays, and résumé — everything for your Common Application in one place.'
            : 'Build your activity list, brainstorm essays, and prep descriptions before application season.'}
        </p>
        <PreviewBadge />
      </div>

      <div className="flex shrink-0 flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className={tabClass(tab === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {(tab === 'activities' || tab === 'awards' || tab === 'projects' || tab === 'resume') && (
          <ExperienceWorkspacePanel tab={tab} />
        )}

        {tab === 'descriptions' && (
          <Panel fillHeight title="Activity Descriptions" subtitle="150-character Common App versions">
            {activities.length === 0 ? (
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Add activities first, then write their Common App descriptions here.
              </p>
            ) : (
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
            )}
          </Panel>
        )}

        {tab === 'essays' && <EssaysWorkspaceTab />}
      </div>
    </CollegePageShell>
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
