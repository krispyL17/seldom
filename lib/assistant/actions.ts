import type { SupabaseClient } from '@supabase/supabase-js'

const ACTION_BLOCK_RE = /```seldom-action\s*\n([\s\S]*?)\n```/gi

export interface SeldomAction {
  type: string
  [key: string]: unknown
}

export interface ExecutedAction {
  type: string
  success: boolean
  summary: string
}

export function parseActionsFromReply(reply: string): { cleanReply: string; actions: SeldomAction[] } {
  const actions: SeldomAction[] = []
  const cleanReply = reply
    .replace(ACTION_BLOCK_RE, (_, body: string) => {
      try {
        const parsed = JSON.parse(body.trim()) as SeldomAction | SeldomAction[]
        if (Array.isArray(parsed)) actions.push(...parsed)
        else actions.push(parsed)
      } catch {
        /* ignore malformed action blocks */
      }
      return ''
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { cleanReply, actions }
}

function normalizeName(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

async function findCollegeByName(
  client: SupabaseClient,
  userId: string,
  name: string,
): Promise<{ id: string; name: string } | null> {
  const target = normalizeName(name)
  if (!target) return null

  const { data, error } = await client.from('colleges').select('id, name').eq('user_id', userId)
  if (error || !data?.length) return null

  const exact = data.find((row) => normalizeName(row.name) === target)
  if (exact) return { id: exact.id as string, name: exact.name as string }

  const partial = data.find(
    (row) =>
      normalizeName(row.name).includes(target) || target.includes(normalizeName(row.name)),
  )
  return partial ? { id: partial.id as string, name: partial.name as string } : null
}

const JUNIOR_CHECKLIST = [
  { key: 'application_submitted', label: 'Submit application', completed: false },
  { key: 'personal_essay', label: 'Personal essay', completed: false },
  { key: 'supplemental_essays', label: 'Supplemental essays', completed: false },
  { key: 'transcript', label: 'Request transcript', completed: false },
  { key: 'test_scores', label: 'Send test scores', completed: false },
  { key: 'recommendations', label: 'Recommendation letters', completed: false },
  { key: 'interview', label: 'Interview prep', completed: false },
  { key: 'financial_aid', label: 'Financial aid forms', completed: false },
  { key: 'scholarships', label: 'Scholarship applications', completed: false },
]

export async function executeCollegeActions(
  client: SupabaseClient,
  userId: string,
  actions: SeldomAction[],
): Promise<ExecutedAction[]> {
  const results: ExecutedAction[] = []

  for (const action of actions) {
    try {
      if (action.type === 'remove_college') {
        const collegeName =
          (action.collegeName as string | undefined) ??
          (action.name as string | undefined) ??
          (action.college as string | undefined)
        const match = collegeName ? await findCollegeByName(client, userId, collegeName) : null
        if (!match) {
          results.push({
            type: action.type,
            success: false,
            summary: `Could not find "${collegeName ?? 'college'}" on your list`,
          })
          continue
        }
        const { error } = await client.from('colleges').delete().eq('id', match.id).eq('user_id', userId)
        if (error) throw error
        results.push({
          type: action.type,
          success: true,
          summary: `Removed ${match.name} from your college list`,
        })
        continue
      }

      if (action.type === 'add_college') {
        const name = typeof action.name === 'string' ? action.name.trim() : ''
        if (!name) {
          results.push({ type: action.type, success: false, summary: 'College name is required to add a school' })
          continue
        }
        const existing = await findCollegeByName(client, userId, name)
        if (existing) {
          results.push({
            type: action.type,
            success: false,
            summary: `${existing.name} is already on your list`,
          })
          continue
        }
        const { error } = await client.from('colleges').insert({
          user_id: userId,
          name,
          location: typeof action.location === 'string' ? action.location : '',
          acceptance_rate: null,
          tuition: null,
          application_type: 'Regular Decision',
          majors: Array.isArray(action.majors) ? action.majors : [],
          status: typeof action.status === 'string' ? action.status : 'researching',
          checklist: JUNIOR_CHECKLIST,
          essays: [],
          deadlines: [],
          documents: [],
        })
        if (error) throw error
        results.push({ type: action.type, success: true, summary: `Added ${name} to your college list` })
        continue
      }

      if (action.type === 'update_college_status') {
        const collegeName =
          (action.collegeName as string | undefined) ?? (action.name as string | undefined)
        const status = typeof action.status === 'string' ? action.status : ''
        const match = collegeName ? await findCollegeByName(client, userId, collegeName) : null
        if (!match || !status) {
          results.push({
            type: action.type,
            success: false,
            summary: 'Could not update college status — need school name and status',
          })
          continue
        }
        const { error } = await client
          .from('colleges')
          .update({ status })
          .eq('id', match.id)
          .eq('user_id', userId)
        if (error) throw error
        results.push({
          type: action.type,
          success: true,
          summary: `Updated ${match.name} status to ${status}`,
        })
        continue
      }

      if (action.type === 'update_student_profile') {
        const { data: row, error: fetchError } = await client
          .from('college_user_data')
          .select('resume_settings')
          .eq('user_id', userId)
          .maybeSingle()
        if (fetchError) throw fetchError

        const resumeSettings = (row?.resume_settings ?? {}) as Record<string, unknown>
        const currentProfile = (resumeSettings.studentProfile ?? {}) as Record<string, unknown>
        const patch = action.profile as Record<string, unknown> | undefined

        const nextProfile = {
          ...currentProfile,
          ...(patch ?? {}),
          ...(typeof action.highSchool === 'string' ? { highSchool: action.highSchool } : {}),
          ...(typeof action.teamQuality === 'string' ? { teamQuality: action.teamQuality } : {}),
          ...(typeof action.universityLinks === 'string'
            ? { universityLinks: action.universityLinks }
            : {}),
          ...(typeof action.intendedMajor === 'string'
            ? { intendedMajor: action.intendedMajor }
            : {}),
        }

        const { error } = await client
          .from('college_user_data')
          .upsert(
            {
              user_id: userId,
              resume_settings: { ...resumeSettings, studentProfile: nextProfile },
            },
            { onConflict: 'user_id' },
          )
        if (error) throw error
        results.push({
          type: action.type,
          success: true,
          summary: 'Updated your student profile',
        })
        continue
      }

      results.push({
        type: action.type,
        success: false,
        summary: `Unknown action type: ${action.type}`,
      })
    } catch (err) {
      results.push({
        type: action.type,
        success: false,
        summary: err instanceof Error ? err.message : 'Action failed',
      })
    }
  }

  return results
}

export const COLLEGE_ACTION_INSTRUCTIONS = `## Data actions (college planning)
When the user asks you to change their college list or profile, append one or more action blocks AFTER your visible reply.
Use exact JSON inside fenced blocks — the app executes them automatically:

\`\`\`seldom-action
{"type":"remove_college","collegeName":"Example University"}
\`\`\`

Supported types:
- remove_college — collegeName (required)
- add_college — name (required), location?, status?, majors? (array)
- update_college_status — collegeName, status (researching|planning|applying|submitted|waiting|accepted|rejected|committed)
- update_student_profile — highSchool?, teamQuality?, universityLinks?, intendedMajor? (or nested "profile" object)

Only emit actions when the user clearly wants a data change. Confirm what you did in plain language in the reply.`
