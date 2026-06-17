'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Command as CommandPrimitive } from 'cmdk'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faXmark,
  faUser,
  faGraduationCap,
  faHashtag,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons'
import { CommandList } from '@/components/ui/command'
import { useSearchSuggestions } from '@/hooks/use-search-suggestions'
import { cn, getInitials } from '@/lib/utils'
import type { SearchResult } from '@/types/search'

// Group results by type for a structured dropdown
function groupResults(results: SearchResult[]) {
  return {
    creators:   results.filter((r) => r.type === 'creator'),
    courses:    results.filter((r) => r.type === 'course'),
    categories: results.filter((r) => r.type === 'category'),
  }
}

const TYPE_ICON: Record<SearchResult['type'], typeof faUser> = {
  creator:         faUser,
  course:          faGraduationCap,
  category:        faHashtag,
  'learning-path': faHashtag,
}

interface MarketplaceSearchProps {
  className?: string
  placeholder?: string
}

export function MarketplaceSearch({
  className,
  placeholder = 'Search creators, courses, topics…',
}: MarketplaceSearchProps) {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const inputRef      = useRef<HTMLInputElement>(null)
  const wrapperRef    = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [open,  setOpen]  = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const { data: results = [], isLoading } = useSearchSuggestions(query)
  const groups      = groupResults(results)
  const hasResults  = results.length > 0
  const showDrop    = open && query.trim().length >= 2

  // Reset active index when results change
  useEffect(() => { setActiveIdx(-1) }, [results])

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const navigate = useCallback((q: string) => {
    setOpen(false)
    router.push(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : '/explore')
  }, [router])

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <CommandPrimitive shouldFilter={false}>

        {/* Input */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className={cn(
              'pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 transition-colors',
              open ? 'text-primary' : 'text-muted-foreground/50',
            )}
          />
          <CommandPrimitive.Input
            ref={inputRef}
            value={query}
            onValueChange={(v) => { setQuery(v); setOpen(true); setActiveIdx(-1) }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.defaultPrevented) navigate(query)
            }}
            placeholder={placeholder}
            aria-label="Search creators or offerings"
            className={cn(
              'h-9.5 w-full border border-border bg-muted/50 pl-10 pr-9 text-sm text-foreground',
              'transition-all duration-150 placeholder:text-muted-foreground/50',
              'hover:bg-muted focus:border-primary/50 focus:bg-background focus:outline-none',
              showDrop
                ? 'rounded-t-2xl border-b-transparent shadow-none focus:ring-0'
                : 'rounded-full shadow-sm focus:ring-2 focus:ring-primary/15',
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground"
            >
              <FontAwesomeIcon icon={faXmark} className="size-3" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDrop && (
          <div className="absolute -left-px -right-px top-full z-50 overflow-hidden rounded-b-2xl border border-t-0 border-primary/50 bg-background shadow-xl">
            <CommandList className="max-h-80">
              {isLoading ? (
                <div className="flex items-center gap-2.5 px-4 py-5 text-sm text-muted-foreground">
                  <div className="size-3.5 animate-spin rounded-full border-2 border-border border-t-primary" />
                  Searching…
                </div>
              ) : hasResults ? (
                <div className="py-2">
                  {/* "Search for X" shortcut */}
                  <button
                    onClick={() => navigate(query)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/60"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="size-3 text-primary" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[13px] font-medium text-foreground">
                        Search for &ldquo;<span className="text-primary">{query}</span>&rdquo;
                      </span>
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} className="ml-auto size-3 text-muted-foreground/40" />
                  </button>

                  <div className="my-1.5 h-px bg-border/50" />

                  {/* Grouped results */}
                  {(
                    [
                      { label: 'Creators', items: groups.creators },
                      { label: 'Courses',  items: groups.courses },
                      { label: 'Topics',   items: groups.categories },
                    ] as const
                  ).map(({ label, items }) =>
                    items.length > 0 ? (
                      <div key={label}>
                        <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                          {label}
                        </p>
                        {items.map((r) => (
                          <SuggestionItem
                            key={r.id}
                            result={r}
                            onSelect={() => {
                              setQuery(r.title)
                              setOpen(false)
                              router.push(r.href)
                            }}
                          />
                        ))}
                      </div>
                    ) : null,
                  )}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm font-medium text-foreground">No results</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Try a different term or browse by niche below.
                  </p>
                </div>
              )}
            </CommandList>
          </div>
        )}

      </CommandPrimitive>
    </div>
  )
}

function SuggestionItem({ result, onSelect }: { result: SearchResult; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted/60"
    >
      {result.thumbnailUrl ? (
        <img
          src={result.thumbnailUrl}
          alt=""
          aria-hidden
          className="size-7 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FontAwesomeIcon
            icon={TYPE_ICON[result.type] ?? faMagnifyingGlass}
            className="size-3 text-muted-foreground"
          />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-medium text-foreground">{result.title}</span>
        {result.subtitle && (
          <span className="truncate text-[11px] text-muted-foreground">{result.subtitle}</span>
        )}
      </span>
      <FontAwesomeIcon icon={faArrowRight} className="size-2.5 shrink-0 text-muted-foreground/30" />
    </button>
  )
}
