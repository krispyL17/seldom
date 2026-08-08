import type { AiSessionOrigin } from '../types'

export function captureOrigin(pathname: string, search: string): AiSessionOrigin {
  return { pathname, search }
}

export function isOnOrigin(
  currentPathname: string,
  currentSearch: string,
  origin: AiSessionOrigin,
): boolean {
  return currentPathname === origin.pathname && currentSearch === origin.search
}

export function originToPath(origin: AiSessionOrigin): string {
  return `${origin.pathname}${origin.search}`
}
