import { useEffect, useState } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Panel } from '@components/ui/Panel'
import { useCollege } from '../../hooks/useCollege'
import type { StudentProfile } from '../../types'

export function StudentContextPanel() {
  const { studentProfile, userData, updateResumeSettings } = useCollege()
  const [name, setName] = useState('')
  const [schoolArea, setSchoolArea] = useState('')
  const [highSchool, setHighSchool] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [intendedMajor, setIntendedMajor] = useState('')
  const [gpa, setGpa] = useState('')
  const [teamQuality, setTeamQuality] = useState('')
  const [universityLinks, setUniversityLinks] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!studentProfile) return
    setName(studentProfile.name ?? '')
    setSchoolArea(studentProfile.school ?? '')
    setHighSchool(studentProfile.highSchool ?? studentProfile.school ?? '')
    setGraduationYear(studentProfile.graduationYear ?? '')
    setIntendedMajor(studentProfile.intendedMajor ?? '')
    setGpa(studentProfile.gpa ?? '')
    setTeamQuality(studentProfile.teamQuality ?? '')
    setUniversityLinks(studentProfile.universityLinks ?? '')
  }, [studentProfile])

  async function save() {
    if (!userData) return
    setSaving(true)
    setSaved(false)
    try {
      const nextProfile: StudentProfile = {
        name: name.trim() || studentProfile?.name || 'Student',
        school: schoolArea.trim(),
        graduationYear: graduationYear.trim(),
        gpa: gpa.trim() || null,
        intendedMajor: intendedMajor.trim() || null,
        highSchool: highSchool.trim() || null,
        teamQuality: teamQuality.trim() || null,
        universityLinks: universityLinks.trim() || null,
      }
      await updateResumeSettings({
        ...userData.resumeSettings,
        studentProfile: nextProfile,
      })
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel
      fillHeight
      title="Your profile"
      subtitle="Used for planning checklists, AI advice, and school list context"
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Graduation year"
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            placeholder="e.g. 2027"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="High school"
            value={highSchool}
            onChange={(e) => setHighSchool(e.target.value)}
            placeholder="e.g. Lincoln High School"
          />
          <Input
            label="School region / area"
            value={schoolArea}
            onChange={(e) => setSchoolArea(e.target.value)}
            placeholder="e.g. Pacific Northwest, in-state"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Intended major"
            value={intendedMajor}
            onChange={(e) => setIntendedMajor(e.target.value)}
            placeholder="e.g. Computer Science"
          />
          <Input
            label="GPA (optional)"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            placeholder="e.g. 3.8 unweighted"
          />
        </div>
        <Input
          label="Team / program level"
          value={teamQuality}
          onChange={(e) => setTeamQuality(e.target.value)}
          placeholder="e.g. State-ranked, competitive club, varsity starter"
        />
        <label className="block text-xs font-medium text-[var(--color-text-tertiary)]">
          University / recruiting links
          <textarea
            value={universityLinks}
            onChange={(e) => setUniversityLinks(e.target.value)}
            rows={2}
            placeholder="Coach connections, showcase events, schools recruiting from your program…"
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
        </label>
        <div className="flex items-center justify-end gap-2">
          {saved && (
            <span className="text-xs text-[var(--color-success)]">Saved</span>
          )}
          <Button type="button" size="sm" disabled={saving} onClick={() => void save()}>
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </div>
    </Panel>
  )
}
