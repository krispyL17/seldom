import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { cn } from '@lib/utils'

/** Internal scroll only when content is at least this multiple of the visible cap. */
export const PANEL_SCROLL_RATIO = 2

interface AdaptivePanelBodyProps {
  children: ReactNode
  className?: string
  /** CSS length for the visible cap (e.g. var(--dashboard-panel-scroll-max)). Omit to always expand. */
  maxHeight?: string
  /** Scroll when content ≥ cap × ratio. Default 2; use 1 for strict caps (e.g. task lists). */
  scrollRatio?: number
}

function resolveCssMaxHeight(maxHeight: string): number {
  const probe = document.createElement('div')
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.pointerEvents = 'none'
  probe.style.height = '100vh'
  probe.style.maxHeight = maxHeight
  probe.style.width = '0'
  document.body.appendChild(probe)
  const px = probe.getBoundingClientRect().height
  probe.remove()
  return px
}

/**
 * Panel body scroll: expand to fit modest overflow; scroll only when content ≥ 2× the cap.
 * Tab panels should omit maxHeight so the tab shell scrolls instead.
 */
export function AdaptivePanelBody({
  children,
  className,
  maxHeight,
  scrollRatio = PANEL_SCROLL_RATIO,
}: AdaptivePanelBodyProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = useState(false)

  const measure = useCallback(() => {
    const el = ref.current
    if (!el || !maxHeight) {
      setScrollable(false)
      return
    }

    const capPx = resolveCssMaxHeight(maxHeight)
    if (capPx <= 0) {
      setScrollable(false)
      return
    }

    const contentHeight = el.scrollHeight
    setScrollable(contentHeight >= capPx * scrollRatio - 1)
  }, [maxHeight, scrollRatio])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    const mo = new MutationObserver(() => measure())
    mo.observe(el, { childList: true, subtree: true, characterData: true })
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  const style: CSSProperties = {}
  if (maxHeight && scrollable) {
    style.maxHeight = maxHeight
  }

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        scrollable && 'overflow-y-auto overscroll-behavior-contain',
        className,
      )}
    >
      {children}
    </div>
  )
}
