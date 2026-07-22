import type { Session, User } from '@supabase/supabase-js'

/** Auth credentials for email/password sign-in */
export interface SignInCredentials {
  email: string
  password: string
}

/** Auth credentials for email/password sign-up */
export interface SignUpCredentials extends SignInCredentials {
  /** Optional display name stored in user metadata */
  displayName?: string
}

/** Result of sign-up when email confirmation is required */
export interface SignUpResult {
  needsEmailConfirmation: boolean
}

/** Shape of the auth context exposed to the React tree */
export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  isAuthenticated: boolean
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<SignUpResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}
