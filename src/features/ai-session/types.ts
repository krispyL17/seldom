export type AiSessionKind = 'assistant' | 'college-advisor'

export interface AiSessionOrigin {
  pathname: string
  search: string
}

export interface AiFloatingSessionState {
  kind: AiSessionKind
  origin: AiSessionOrigin
  label: string
  isBusy: boolean
  /** User sent a message this session — popup eligible after navigation away */
  engaged: boolean
}
