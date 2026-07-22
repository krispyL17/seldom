import type { ApplicationPhase, ChecklistItem } from './types'
import { DEFAULT_CHECKLIST, JUNIOR_CHECKLIST } from './types'

/** Relabel junior prep checklist items to senior application checklist (preserves completion). */
export function migrateChecklistToSenior(checklist: ChecklistItem[]): ChecklistItem[] {
  const seniorByKey = new Map(DEFAULT_CHECKLIST.map((item) => [item.key, item]))
  return checklist.map((item) => {
    const senior = seniorByKey.get(item.key)
    return senior ? { ...senior, completed: item.completed } : item
  })
}

/** Checklist labels for the current phase. */
export function checklistForPhase(phase: ApplicationPhase, checklist: ChecklistItem[]): ChecklistItem[] {
  if (phase === 'senior') {
    const seniorByKey = new Map(DEFAULT_CHECKLIST.map((item) => [item.key, item]))
    return checklist.map((item) => {
      const senior = seniorByKey.get(item.key)
      return senior ? { ...senior, completed: item.completed } : item
    })
  }
  const juniorByKey = new Map(JUNIOR_CHECKLIST.map((item) => [item.key, item]))
  return checklist.map((item) => {
    const junior = juniorByKey.get(item.key)
    return junior ? { ...junior, completed: item.completed } : item
  })
}

export function phaseLabel(phase: ApplicationPhase): string {
  return phase === 'junior' ? 'Rising Junior Prep' : 'Senior Applications'
}

export function phaseDescription(phase: ApplicationPhase): string {
  return phase === 'junior'
    ? 'Research schools, build your list, and prepare before application season'
    : 'Full application command center — deadlines, essays, recs & submissions'
}
