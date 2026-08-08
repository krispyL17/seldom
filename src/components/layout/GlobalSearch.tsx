import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildSearchIndex, filterSearchResults, type SearchResult } from '@config/searchIndex'
import { useUserPreferences } from '@features/preferences'
import { cn } from '@lib/utils'
import { IconSearch } from '@components/ui/icons'

interface GlobalSearchProps {
  className?: string
  inputClassName?: string
  autoFocus?: boolean
  onNavigate?: () => void
}

export function GlobalSearch({
  className,
  inputClassName,
  autoFocus,
  onNavigate,
}: GlobalSearchProps) {
  const navigate = useNavigate()
  const { hobbyTabLabel, hobbyPassion } = useUserPreferences()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const index = useMemo(
    () => buildSearchIndex(hobbyTabLabel, hobbyPassion),
    [hobbyTabLabel, hobbyPassion],
  )

  const results = useMemo(() => filterSearchResults(query, index), [query, index])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function goTo(result: SearchResult) {
    navigate(result.href)
    setQuery('')
    setOpen(false)
    onNavigate?.()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)))
      setOpen(true)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault()
      goTo(results[activeIndex]!)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <label className="relative block">
        <span className="sr-only">Search Seldom</span>
        <IconSearch
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder="Search tasks, goals, tabs…"
          className={cn(
            'h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
            'bg-[var(--color-surface-overlay)] pl-9 pr-4 text-sm text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-tertiary)]',
            'transition-colors duration-200',
            'hover:border-[var(--color-border-strong)]',
            'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
            inputClassName,
          )}
        />
      </label>

      {open && query.trim() && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[400] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-elevated)]"
          role="listbox"
        >
          {results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[var(--color-text-tertiary)]">No matches</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((result, i) => (
                <li key={result.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    className={cn(
                      'flex w-full flex-col items-start px-3 py-2 text-left transition-colors',
                      i === activeIndex
                        ? 'bg-[var(--color-accent-subtle)]'
                        : 'hover:bg-[var(--color-surface-overlay)]',
                    )}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => goTo(result)}
                  >
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {result.label}
                    </span>
                    {result.description && (
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">
                        {result.description}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
