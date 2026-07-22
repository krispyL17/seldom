import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility for merging Tailwind CSS class names.
 * Combines clsx for conditional classes with tailwind-merge
 * to resolve conflicting utility classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
