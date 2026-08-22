/** Side preference for sports with dominant/weak sides */
export type SidePreference = 'left' | 'right' | 'both' | 'unknown'

export interface SideBalance {
  dominant_pct: number
  weak_pct: number
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365] as const

export interface StreakState {
  current: number
  longest: number
  lastActivityDate: string | null
  /** When true (Injury Mode), streak does not drop on missed days */
  frozen: boolean
  frozenAtStreak: number | null
  explained: boolean
  milestonesAchieved: number[]
}

export interface InjuryModeState {
  active: boolean
  activatedAt: string | null
  reason: string | null
  aiSuggested: boolean
}

export interface AthleteSideProfile {
  dominantSide: SidePreference
  weakSide: SidePreference
  preferredHand: SidePreference | 'none'
  usesSideTracking: boolean
}

export interface CustomPerformanceTab {
  id: string
  label: string
  slug: string
  focusHint: string
}

/** User-editable skill tracked in session logs and the Skills heatmap. */
export interface TrainingSkill {
  id: string
  label: string
  slug: string
}

export interface KnowledgeImportChunk {
  id: string
  sourceFile: string
  category: 'training' | 'technique' | 'recovery' | 'goals' | 'general'
  title: string
  content: string
  importedAt: string
}

export interface AthleteDevelopmentState {
  streak: StreakState
  injuryMode: InjuryModeState
  sideProfile: AthleteSideProfile
  /** Unlocks the Gym sub-tab when true (set during performance onboarding). */
  gymEnabled: boolean
  /** @deprecated migrated to skills */
  customTabs: CustomPerformanceTab[]
  skills: TrainingSkill[]
  skillsSeeded: boolean
  /** @deprecated */
  customTabsPromptDismissed: boolean
  /** @deprecated */
  customTabsDisabled: boolean
  knowledgeImports: KnowledgeImportChunk[]
}

export const DEFAULT_STREAK: StreakState = {
  current: 0,
  longest: 0,
  lastActivityDate: null,
  frozen: false,
  frozenAtStreak: null,
  explained: false,
  milestonesAchieved: [],
}

export const DEFAULT_INJURY_MODE: InjuryModeState = {
  active: false,
  activatedAt: null,
  reason: null,
  aiSuggested: false,
}

export const DEFAULT_SIDE_PROFILE: AthleteSideProfile = {
  dominantSide: 'unknown',
  weakSide: 'unknown',
  preferredHand: 'none',
  usesSideTracking: false,
}

export const DEFAULT_ATHLETE_DEVELOPMENT: AthleteDevelopmentState = {
  streak: DEFAULT_STREAK,
  injuryMode: DEFAULT_INJURY_MODE,
  sideProfile: DEFAULT_SIDE_PROFILE,
  gymEnabled: false,
  customTabs: [],
  skills: [],
  skillsSeeded: false,
  customTabsPromptDismissed: false,
  customTabsDisabled: false,
  knowledgeImports: [],
}
