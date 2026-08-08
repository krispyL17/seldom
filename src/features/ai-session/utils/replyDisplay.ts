/** Show character animation only for long replies — short ones appear instantly. */
export function shouldAnimateReply(text: string): boolean {
  return text.length > 360
}

export const REPLY_ANIMATION_INTERVAL_MS = 8
