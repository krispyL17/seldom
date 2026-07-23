import type { SVGProps } from 'react'

/** Shared SVG icon props — 20×20 default size */
type IconProps = SVGProps<SVGSVGElement>

const defaultProps: IconProps = {
  width: 20,
  height: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconHome(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

export function IconTasks(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  )
}

export function IconGoals(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconJournal(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <path d="M6 3h10a2 2 0 0 1 2 2v16H8a2 2 0 0 1-2-2V3z" />
      <path d="M6 3v16a2 2 0 0 0 2 2" />
      <path d="M10 8h6M10 12h6" />
    </svg>
  )
}

export function IconSoccer(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v4.5M12 16.5V21M3 12h4.5M16.5 12H21" />
      <path d="m8.5 8.5 3.5 2 3.5-2-1-3.5h-5L8.5 8.5z" />
    </svg>
  )
}

export function IconAnalytics(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" />
    </svg>
  )
}

export function IconSettings(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export function IconBell(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <path d="M18 16H6l1.2-1.6A4 4 0 0 0 8 11.5V9a4 4 0 1 1 8 0v2.5a4 4 0 0 0 .8 2.9L18 16z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function IconUser(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  )
}

export function IconMenu(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function IconClose(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

/** Small checkmark used in task lists and priority items */
export function IconCheck({ size = 10, ...props }: IconProps & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      {...props}
    >
      <path
        d="M2 5l2.5 2.5L8 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconCollege(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <path d="M4 10.5 12 5l8 5.5V20a1 1 0 0 1-1 1h-5v-5h-4v5H5a1 1 0 0 1-1-1v-9.5z" />
      <path d="M12 5v3.5M9 9.5h6" />
    </svg>
  )
}

export function IconCalendar(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}

export function IconSparkles(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <path d="M12 3l1.2 4.2L17 8l-3.8 1.2L12 14l-1.2-4.8L7 8l3.8-.8L12 3z" />
      <path d="M19 14l.8 2.5L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.5L19 14z" />
    </svg>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaultProps} {...props}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  )
}
