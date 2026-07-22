import type { Activity, Award, Project, ResumeTemplate } from '../../types'
import { formatDateRange } from '../../utils'

interface ResumePreviewProps {
  template: ResumeTemplate
  activities: Activity[]
  awards: Award[]
  projects: Project[]
}

export function ResumePreview({ template, activities, awards, projects }: ResumePreviewProps) {
  const isCompact = template === 'compact'
  const isModern = template === 'modern'

  return (
    <article
      className={
        isModern
          ? 'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-6 text-black shadow-[var(--shadow-panel)]'
          : 'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-panel)]'
      }
    >
      <header className={isModern ? 'border-b-2 border-[#2525a6] pb-3' : 'border-b border-[var(--color-border)] pb-3'}>
        <h1
          className={
            isCompact
              ? 'text-lg font-bold text-[var(--color-text-primary)]'
              : 'text-xl font-bold text-[var(--color-text-primary)]'
          }
        >
          Activities & Achievements Résumé
        </h1>
        <p className="text-xs text-[var(--color-text-tertiary)]">Generated from Seldom College Prep</p>
      </header>

      {activities.length > 0 && (
        <section className="mt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent-muted)]">
            Activities
          </h2>
          <ul className={`mt-2 space-y-${isCompact ? '2' : '3'}`}>
            {activities.map((a) => (
              <li key={a.id} className="text-xs">
                <p className="font-medium text-[var(--color-text-primary)]">
                  {a.name}
                  {a.role && ` — ${a.role}`}
                </p>
                <p className="text-[var(--color-text-tertiary)]">
                  {a.organization} · {formatDateRange(a.startDate, a.endDate)}
                </p>
                {!isCompact && a.description && (
                  <p className="mt-0.5 text-[var(--color-text-secondary)]">{a.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {awards.length > 0 && (
        <section className="mt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent-muted)]">
            Awards
          </h2>
          <ul className="mt-2 space-y-1">
            {awards.map((a) => (
              <li key={a.id} className="text-xs text-[var(--color-text-primary)]">
                {a.name}
                {a.level && ` (${a.level})`}
                {a.awardDate && ` — ${a.awardDate}`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent-muted)]">
            Projects & Research
          </h2>
          <ul className="mt-2 space-y-2">
            {projects.map((p) => (
              <li key={p.id} className="text-xs">
                <p className="font-medium text-[var(--color-text-primary)]">{p.name}</p>
                {p.myRole && <p className="text-[var(--color-text-tertiary)]">{p.myRole}</p>}
                {p.description && (
                  <p className="text-[var(--color-text-secondary)]">{p.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {activities.length === 0 && awards.length === 0 && projects.length === 0 && (
        <p className="mt-4 text-xs text-[var(--color-text-tertiary)]">
          Select activities, awards, or projects to preview your résumé.
        </p>
      )}
    </article>
  )
}
