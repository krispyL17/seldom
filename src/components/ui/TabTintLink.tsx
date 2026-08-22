import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useNavTabColor } from '@hooks/useNavTabColor'
import { cn } from '@lib/utils'

interface TabTintLinkProps {
  to: string
  children: ReactNode
  /** Sidebar nav id for bookmark tint color */
  accentNavId?: string
  /** Override tint when accentNavId is omitted */
  accentColor?: string
  className?: string
  title?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

const tintBase =
  'text-[var(--color-text-secondary)] transition-[color,background-color] duration-150 hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'

/** Hyperlink with a subtle tab-color wash that strengthens on hover */
export function TabTintLink({
  to,
  children,
  accentNavId,
  accentColor,
  className,
  title,
  onClick,
}: TabTintLinkProps) {
  const tabColor = useNavTabColor(accentNavId ?? 'home')
  const color = accentColor ?? tabColor

  return (
    <Link
      to={to}
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium',
        tintBase,
        className,
      )}
      style={
        {
          '--tab-tint': color,
          backgroundColor: 'color-mix(in srgb, var(--tab-tint) 14%, transparent)',
        } as CSSProperties
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--tab-tint) 28%, transparent)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--tab-tint) 14%, transparent)'
      }}
    >
      {children}
    </Link>
  )
}

/** Compact chip link for dense lists (calendar rows, tags) */
export function TabTintChipLink({
  to,
  children,
  accentNavId,
  accentColor,
  className,
  title,
}: TabTintLinkProps) {
  const tabColor = useNavTabColor(accentNavId ?? 'home')
  const color = accentColor ?? tabColor

  return (
    <Link
      to={to}
      title={title}
      className={cn(
        'block truncate rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs leading-snug',
        tintBase,
        className,
      )}
      style={
        {
          '--tab-tint': color,
          backgroundColor: 'color-mix(in srgb, var(--tab-tint) 16%, transparent)',
        } as CSSProperties
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--tab-tint) 30%, transparent)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--tab-tint) 16%, transparent)'
      }}
    >
      {children}
    </Link>
  )
}
