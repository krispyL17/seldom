import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PRIMARY_SIDEBAR_NAV } from '@config/navigation'
import { cn } from '@lib/utils'
import { usePanelBookmarkAccent } from '@hooks/usePanelBookmarkAccent'
import { useNavTabColor } from '@hooks/useNavTabColor'
import { useUserPreferences } from '@features/preferences'
import { AdaptivePanelBody } from './AdaptivePanelBody'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  badge?: ReactNode
  action?: ReactNode
  children: ReactNode
  /** Tint ledger accents from this nav tab's bookmark color (dashboard panels). */
  accentNavId?: string
  /** Span full width in dashboard grid */
  fullWidth?: boolean
  /** Minimum height in grid layouts; body expands (no internal scroll on tabs). */
  fillHeight?: boolean
  /** Cap body height with 2× scroll rule — for dashboard panels with long lists */
  scrollCap?: boolean
  /** Override scroll cap height (CSS length). Defaults to --dashboard-panel-scroll-max. */
  scrollMaxHeight?: string
  /** Scroll when content ≥ cap × ratio. Default 2; use 1 for strict row caps. */
  scrollRatio?: number
  noPadding?: boolean
}

/** Panel — scoreboard ledger section with top accent rule + flat body. */
export function Panel({
  title,
  subtitle,
  badge,
  action,
  children,
  accentNavId,
  fullWidth = false,
  fillHeight = false,
  scrollCap = false,
  scrollMaxHeight = 'var(--dashboard-panel-scroll-max)',
  scrollRatio,
  noPadding = false,
  className,
  style,
  ...props
}: PanelProps) {
  const bookmarkAccent = usePanelBookmarkAccent(accentNavId)
  const bodyClass = cn(
    fillHeight ? 'panel-body-fill min-h-0 flex-1' : 'shrink-0',
    noPadding ? '' : 'p-4',
  )

  return (
    <section
      className={cn(
        'panel flex flex-col',
        scrollCap && 'overflow-hidden',
        fullWidth && 'lg:col-span-2',
        fillHeight && 'panel--fill-height min-h-0',
        scrollCap && 'panel--scroll-cap',
        className,
      )}
      style={{ ...bookmarkAccent, ...style } as CSSProperties}
      {...props}
    >
      <header className="panel-header px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display truncate text-sm font-semibold tracking-tight">
              {title}
            </h3>
            {badge}
          </div>
          {subtitle && (
            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[var(--color-text-secondary)]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>

      {scrollCap ? (
        <AdaptivePanelBody
          maxHeight={scrollMaxHeight}
          scrollRatio={scrollRatio}
          className={bodyClass}
        >
          {children}
        </AdaptivePanelBody>
      ) : (
        <div className={bodyClass}>{children}</div>
      )}
    </section>
  )
}

/** Dense label / value row used inside panels */
export function DataRow({
  label,
  value,
  subValue,
  highlight,
  className,
}: {
  label: string
  value: ReactNode
  subValue?: string
  highlight?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-[var(--color-border)] py-2.5 last:border-0',
        highlight && 'bg-[var(--color-danger)]/5 -mx-4 px-4 rounded-sm',
        className,
      )}
    >
      <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      <div className="text-right">
        <span className="text-xs font-medium tabular-nums text-[var(--color-text-primary)]">
          {value}
        </span>
        {subValue && (
          <p className="text-xs text-[var(--color-text-tertiary)]">{subValue}</p>
        )}
      </div>
    </div>
  )
}

/** Section divider with optional label inside a panel */
export function PanelDivider({ label }: { label?: string }) {
  if (!label) {
    return <hr className="my-3 border-[var(--color-border)]" />
  }
  return (
    <div className="my-3 flex items-center gap-2">
      <span className="text-xs font-medium text-[var(--color-text-tertiary)]">{label}</span>
      <div className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  )
}

function panelGoToLabel(accentNavId: string | undefined, hobbyTabLabel: string): string {
  if (accentNavId === 'soccer') return hobbyTabLabel
  if (!accentNavId) return 'Open'
  return PRIMARY_SIDEBAR_NAV.find((item) => item.id === accentNavId)?.label ?? 'Open'
}

/** Panel header link — tab-tinted hyperlink */
export function PanelGoToLink({
  to,
  accentNavId,
  className,
  children,
}: {
  to: string
  accentNavId?: string
  className?: string
  children?: ReactNode
}) {
  const { hobbyTabLabel } = useUserPreferences()
  const tabColor = useNavTabColor(accentNavId ?? 'home')
  const label = children ?? panelGoToLabel(accentNavId, hobbyTabLabel)

  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium',
        'text-[var(--color-text-secondary)] transition-[color,background-color] duration-150',
        'hover:text-[var(--color-text-primary)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
        className,
      )}
      style={
        {
          '--tab-tint': tabColor,
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
      {label}
    </Link>
  )
}

/** Standard action link styled for panel headers */
export function PanelActionLink({
  children,
  to,
  accentNavId,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { to?: string; accentNavId?: string }) {
  const tabColor = useNavTabColor(accentNavId ?? 'home')
  const tintStyles = cn(
    'inline-flex items-center rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium',
    'text-[var(--color-text-secondary)] transition-[color,background-color] duration-150',
    'hover:text-[var(--color-text-primary)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
  )

  const tintStyle = {
    '--tab-tint': tabColor,
    backgroundColor: 'color-mix(in srgb, var(--tab-tint) 14%, transparent)',
  } as CSSProperties

  const hoverHandlers = {
    onMouseEnter: (e: MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--tab-tint) 28%, transparent)'
    },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--tab-tint) 14%, transparent)'
    },
  }

  if (to) {
    return (
      <Link to={to} className={cn(tintStyles, className)} style={tintStyle} {...hoverHandlers}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={cn(tintStyles, className)} style={tintStyle} {...hoverHandlers} {...props}>
      {children}
    </button>
  )
}
