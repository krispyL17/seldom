import { useMemo, useRef, useState } from 'react'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { Panel } from '@components/ui/Panel'
import { Input } from '@components/ui/Input'
import { Textarea } from '@components/ui/Textarea'
import { Badge } from '@components/ui/Badge'
import { IconPlus } from '@components/ui/icons'
import { useCollege } from '../../hooks/useCollege'
import { ResumePreview } from '../resume/ResumePreview'
import type { Activity, ActivityCategory, CreateActivityInput, CreateAwardInput, CreateProjectInput } from '../../types'
import { ACTIVITY_CATEGORIES, RESUME_TEMPLATES } from '../../types'
import { formatDateRange, parseSkillsInput } from '../../utils'

type Tab = 'activities' | 'awards' | 'projects' | 'resume'

const TABS: { id: Tab; label: string }[] = [
  { id: 'activities', label: 'Activities' },
  { id: 'awards', label: 'Awards' },
  { id: 'projects', label: 'Projects & Research' },
  { id: 'resume', label: 'Resume Builder' },
]

export function ActivitiesResumePage() {
  const {
    activities,
    awards,
    projects,
    userData,
    createActivity,
    deleteActivity,
    createAward,
    deleteAward,
    createProject,
    deleteProject,
    updateResumeSettings,
  } = useCollege()

  const [tab, setTab] = useState<Tab>('activities')
  const [modal, setModal] = useState<'activity' | 'award' | 'project' | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const settings = userData?.resumeSettings

  const selectedActivities = useMemo(
    () => activities.filter((a) => settings?.selectedActivityIds.includes(a.id)),
    [activities, settings],
  )
  const selectedAwards = useMemo(
    () => awards.filter((a) => settings?.selectedAwardIds.includes(a.id)),
    [awards, settings],
  )
  const selectedProjects = useMemo(
    () => projects.filter((p) => settings?.selectedProjectIds.includes(p.id)),
    [projects, settings],
  )

  function exportPdf() {
    window.print()
  }

  function toggleSelection(type: 'activity' | 'award' | 'project', id: string) {
    if (!settings || !userData) return
    const key =
      type === 'activity'
        ? 'selectedActivityIds'
        : type === 'award'
          ? 'selectedAwardIds'
          : 'selectedProjectIds'
    const current = settings[key]
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    updateResumeSettings({ ...settings, [key]: next })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {TABS.map((t) => (
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

      {tab === 'activities' && (
        <Panel
          title="Activities"
          subtitle={`${activities.length} entries — structured for Common App`}
          action={
            <Button size="sm" onClick={() => setModal('activity')}>
              <IconPlus /> Add
            </Button>
          }
        >
          <ul className="space-y-3">
            {activities.map((a) => (
              <ActivityCard key={a.id} activity={a} onDelete={() => deleteActivity(a.id)} />
            ))}
          </ul>
        </Panel>
      )}

      {tab === 'awards' && (
        <Panel
          title="Awards & Honors"
          subtitle={`${awards.length} entries`}
          action={
            <Button size="sm" onClick={() => setModal('award')}>
              <IconPlus /> Add
            </Button>
          }
        >
          <ul className="space-y-3">
            {awards.map((a) => (
              <li
                key={a.id}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3"
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{a.name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {[a.organization, a.level, a.awardDate].filter(Boolean).join(' · ')}
                    </p>
                    {a.description && (
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{a.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteAward(a.id)}
                    className="text-[10px] text-[var(--color-danger)]"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === 'projects' && (
        <Panel
          title="Projects & Research"
          subtitle={`${projects.length} entries`}
          action={
            <Button size="sm" onClick={() => setModal('project')}>
              <IconPlus /> Add
            </Button>
          }
        >
          <ul className="space-y-3">
            {projects.map((p) => (
              <li
                key={p.id}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3"
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{p.name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {p.myRole}
                      {p.technologies.length > 0 && ` · ${p.technologies.join(', ')}`}
                    </p>
                    {p.description && (
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{p.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteProject(p.id)}
                    className="text-[10px] text-[var(--color-danger)]"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === 'resume' && settings && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Resume Builder" subtitle="Select experiences & export">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase text-[var(--color-text-tertiary)]">
                  Template
                </p>
                <div className="flex flex-wrap gap-2">
                  {RESUME_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateResumeSettings({ ...settings, template: t.id })}
                      className={
                        settings.template === t.id
                          ? 'rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 py-1 text-xs text-white'
                          : 'rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1 text-xs'
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <SelectionGroup
                title="Activities"
                items={activities.map((a) => ({ id: a.id, label: a.name }))}
                selected={settings.selectedActivityIds}
                onToggle={(id) => toggleSelection('activity', id)}
              />
              <SelectionGroup
                title="Awards"
                items={awards.map((a) => ({ id: a.id, label: a.name }))}
                selected={settings.selectedAwardIds}
                onToggle={(id) => toggleSelection('award', id)}
              />
              <SelectionGroup
                title="Projects"
                items={projects.map((p) => ({ id: p.id, label: p.name }))}
                selected={settings.selectedProjectIds}
                onToggle={(id) => toggleSelection('project', id)}
              />

              <Button onClick={exportPdf}>Export PDF</Button>
            </div>
          </Panel>

          <div ref={printRef} className="print-resume">
            <ResumePreview
              template={settings.template}
              activities={selectedActivities}
              awards={selectedAwards}
              projects={selectedProjects}
            />
          </div>
        </div>
      )}

      {modal === 'activity' && (
        <ActivityFormModal onClose={() => setModal(null)} onSubmit={createActivity} />
      )}
      {modal === 'award' && (
        <AwardFormModal onClose={() => setModal(null)} onSubmit={createAward} />
      )}
      {modal === 'project' && (
        <ProjectFormModal onClose={() => setModal(null)} onSubmit={createProject} />
      )}
    </div>
  )
}

function ActivityCard({ activity, onDelete }: { activity: Activity; onDelete: () => void }) {
  return (
    <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{activity.name}</p>
            <Badge variant="muted">{activity.category}</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            {activity.organization}
            {activity.role && ` · ${activity.role}`}
            {' · '}
            {formatDateRange(activity.startDate, activity.endDate)}
          </p>
          {activity.description && (
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{activity.description}</p>
          )}
          {(activity.weeklyHours || activity.weeksPerYear) && (
            <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">
              {activity.weeklyHours ?? '?'} hrs/wk · {activity.weeksPerYear ?? '?'} wks/yr
            </p>
          )}
        </div>
        <button type="button" onClick={onDelete} className="text-[10px] text-[var(--color-danger)]">
          Delete
        </button>
      </div>
    </li>
  )
}

function SelectionGroup({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string
  items: { id: string; label: string }[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase text-[var(--color-text-tertiary)]">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-center gap-2 text-xs">
              <input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} />
              {item.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ActivityFormModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (input: CreateActivityInput) => Promise<unknown>
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ActivityCategory>('Academic')
  const [organization, setOrganization] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        name,
        category,
        organization,
        role,
        description,
        skills: parseSkillsInput(skills),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={true} title="Add activity" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <label className="block text-xs text-[var(--color-text-secondary)]">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ActivityCategory)}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-sm"
          >
            {ACTIVITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <Input label="Organization" value={organization} onChange={(e) => setOrganization(e.target.value)} />
        <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <Input label="Skills (comma-separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
        <Button type="submit" disabled={saving || !name.trim()}>
          Save
        </Button>
      </form>
    </Modal>
  )
}

function AwardFormModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (input: CreateAwardInput) => Promise<unknown>
}) {
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [level, setLevel] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ name, organization, level, description })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={true} title="Add award" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Organization" value={organization} onChange={(e) => setOrganization(e.target.value)} />
        <Input label="Level" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="School, State, National…" />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <Button type="submit" disabled={saving || !name.trim()}>
          Save
        </Button>
      </form>
    </Modal>
  )
}

function ProjectFormModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (input: CreateProjectInput) => Promise<unknown>
}) {
  const [name, setName] = useState('')
  const [myRole, setMyRole] = useState('')
  const [description, setDescription] = useState('')
  const [technologies, setTechnologies] = useState('')
  const [results, setResults] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        name,
        myRole,
        description,
        technologies: parseSkillsInput(technologies),
        results,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={true} title="Add project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="My role" value={myRole} onChange={(e) => setMyRole(e.target.value)} />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <Input label="Technologies" value={technologies} onChange={(e) => setTechnologies(e.target.value)} />
        <Textarea label="Results" value={results} onChange={(e) => setResults(e.target.value)} rows={2} />
        <Button type="submit" disabled={saving || !name.trim()}>
          Save
        </Button>
      </form>
    </Modal>
  )
}
