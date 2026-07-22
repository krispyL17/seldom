/**
 * Maps Supabase Auth error messages to user-friendly copy.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return 'Something went wrong. Please try again.'

  const msg = error.message.toLowerCase()

  if (msg.includes('invalid login credentials')) {
    return 'Incorrect email or password.'
  }
  if (msg.includes('user already registered')) {
    return 'An account with this email already exists.'
  }
  if (msg.includes('password should be at least')) {
    return 'Password must be at least 6 characters.'
  }
  if (msg.includes('unable to validate email')) {
    return 'Please enter a valid email address.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.'
  }
  if (msg.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  return error.message
}
