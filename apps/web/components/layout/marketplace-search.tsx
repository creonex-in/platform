'use client'

import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
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
  faArrowTurnDown,
  faArrowTrendUp,
} from '@fortawesome/free-solid-svg-icons'
import { useSearchSuggestions } from '@/hooks/use-search-suggestions'
import { NICHE_OPTIONS } from '@/constants/onboarding'
import { FEATURED_NICHES } from '@/lib/niche'
import { cn, getInitials } from '@/lib/utils'
import type { SearchResult } from '@/types/search'

/** Static quick-picks shown on focus before the user types — feels alive + guides discovery. */
const POPULAR_SEARCHES = ['Mock interview', 'DSA patterns', 'Resume review', 'UI/UX portfolio', 'SIP & investing']

const FEATURED_NICHE_OPTIONS = NICHE_OPTIONS.filter(
  (n) => (FEATURED_NICHES as readonly string[]).includes(n.value as string),
)

const GROUP_HEADING_CLASS =
  '[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-muted-foreground/60'

const TYPE_ICON: Record<SearchResult['type'], typeof faUser> = {
  creator: faUser,
  course: faGraduationCap,
  category: faHashtag,
  'learning-path': faHashtag,
}

// Show at most this many rows per group; the "Search for …" shortcut covers the rest.
const PER_GROUP_CAP = 4

function groupResults(results: SearchResult[]) {
  return [
    { key: 'creators', label: 'Creators', items: results.filter((r) => r.type === 'creator').slice(0, PER_GROUP_CAP) },
    { key: 'courses', label: 'Courses', items: results.filter((r) => r.type === 'course').slice(0, PER_GROUP_CAP) },
    { key: 'topics', label: 'Topics', items: results.filter((r) => r.type === 'category').slice(0, PER_GROUP_CAP) },
  ].filter((g) => g.items.length > 0)
}

interface MarketplaceSearchProps {
  className?: string
  placeholder?: string
}

function MarketplaceSearchInner({
  className,
  placeholder = 'Search creators, courses, topics…',
}: MarketplaceSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [open, setOpen] = useState(false)

  const { data: results = [], isLoading } = useSearchSuggestions(query)
  const groups = groupResults(results)
  const hasResults = results.length > 0
  const trimmed = query.trim()
  const isSearching = trimmed.length >= 2
  // Open on focus — show a default "popular + browse" panel until the user types 2+ chars.
  const showDrop = open

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const goToSearch = useCallback(
    (q: string) => {
      setOpen(false)
      router.push(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : '/explore')
    },
    [router],
  )

  const goToResult = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  return (
    // cmdk owns keyboard nav (↑/↓ to move, ↵ to select the highlighted row) and
    // the combobox/listbox/option a11y roles — items below are CommandPrimitive.Item.
    <CommandPrimitive
      ref={wrapperRef}
      shouldFilter={false}
      className={cn('relative', className)}
      // Let ↵ fall through to the highlighted item; only handle the bare-input case.
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.defaultPrevented && !hasResults) goToSearch(query)
      }}
    >
      {/* Input */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className={cn(
            'pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 transition-colors duration-200',
            showDrop ? 'text-primary' : 'text-muted-foreground/60',
          )}
        />
        <CommandPrimitive.Input
          ref={inputRef}
          value={query}
          onValueChange={(v) => {
            setQuery(v)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label="Search creators, courses or topics"
          className={cn(
            'h-11 w-full rounded-full border border-border bg-muted/40 pl-11 pr-10 text-sm text-foreground',
            'shadow-sm transition-all duration-200 placeholder:text-muted-foreground/60',
            'hover:bg-muted/70 hover:border-border',
            'focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10',
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
          >
            <FontAwesomeIcon icon={faXmark} className="size-3.5" />
          </button>
        )}
      </div>

      {/* Floating dropdown — gapped from the input so there is no brittle border seam. */}
      {showDrop && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
          <CommandPrimitive.List className="no-scrollbar max-h-[22rem] overflow-y-auto overscroll-contain p-2">
            {!isSearching ? (
              <DefaultPanel
                onSearch={goToSearch}
                onNiche={(v) => goToResult(`/explore?niche=${v}`)}
              />
            ) : isLoading ? (
              <SkeletonRows />
            ) : (
              <>
                {/* "Search for X" shortcut — first item, so a bare ↵ runs the full search. */}
                <CommandPrimitive.Group>
                  <CommandPrimitive.Item
                    value={`__search__${trimmed}`}
                    onSelect={() => goToSearch(query)}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 text-left outline-none transition-colors data-[selected=true]:bg-muted"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                      Search for &ldquo;<span className="text-primary">{trimmed}</span>&rdquo;
                    </span>
                    <KbdEnter />
                  </CommandPrimitive.Item>
                </CommandPrimitive.Group>

                {hasResults ? (
                  <>
                    <div className="mx-2 my-1.5 h-px bg-border/60" />
                    {groups.map((group) => (
                      <CommandPrimitive.Group
                        key={group.key}
                        heading={group.label}
                        className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-muted-foreground/60"
                      >
                        {group.items.map((r) => (
                          <SuggestionItem key={r.id} result={r} onSelect={() => goToResult(r.href)} />
                        ))}
                      </CommandPrimitive.Group>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground/50">
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="size-4" />
                    </span>
                    <p className="text-sm font-medium text-foreground">No matches for &ldquo;{trimmed}&rdquo;</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Try a different term or browse by niche below.</p>
                  </div>
                )}
              </>
            )}
          </CommandPrimitive.List>

          {/* Hint footer */}
          <div className="flex items-center gap-4 border-t border-border/60 bg-muted/30 px-3.5 py-2 text-[10px] text-muted-foreground/70">
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd>
              to select
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <Kbd>esc</Kbd>
              to close
            </span>
          </div>
        </div>
      )}
    </CommandPrimitive>
  )
}

/** Shown on focus before typing — popular searches + browse-by-niche. Keyboard-navigable. */
function DefaultPanel({
  onSearch,
  onNiche,
}: {
  onSearch: (q: string) => void
  onNiche: (niche: string) => void
}) {
  return (
    <>
      <CommandPrimitive.Group heading="Popular searches" className={GROUP_HEADING_CLASS}>
        {POPULAR_SEARCHES.map((term) => (
          <CommandPrimitive.Item
            key={term}
            value={`popular:${term}`}
            onSelect={() => onSearch(term)}
            className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left outline-none transition-colors data-[selected=true]:bg-muted"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <FontAwesomeIcon icon={faArrowTrendUp} className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">{term}</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="size-3 shrink-0 text-muted-foreground/0 transition-colors group-data-[selected=true]:text-muted-foreground/40"
            />
          </CommandPrimitive.Item>
        ))}
      </CommandPrimitive.Group>

      <div className="mx-2 my-1.5 h-px bg-border/60" />

      <CommandPrimitive.Group heading="Browse by niche" className={GROUP_HEADING_CLASS}>
        {FEATURED_NICHE_OPTIONS.map((n) => (
          <CommandPrimitive.Item
            key={n.value}
            value={`niche:${n.value}`}
            onSelect={() => onNiche(n.value)}
            className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left outline-none transition-colors data-[selected=true]:bg-muted"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FontAwesomeIcon icon={n.icon} className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">{n.label}</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="size-3 shrink-0 text-muted-foreground/0 transition-colors group-data-[selected=true]:text-muted-foreground/40"
            />
          </CommandPrimitive.Item>
        ))}
      </CommandPrimitive.Group>
    </>
  )
}

function SuggestionItem({ result, onSelect }: { result: SearchResult; onSelect: () => void }) {
  const isCreator = result.type === 'creator'
  return (
    <CommandPrimitive.Item
      value={`${result.type}:${result.id}`}
      onSelect={onSelect}
      className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left outline-none transition-colors data-[selected=true]:bg-muted"
    >
      {result.thumbnailUrl ? (
        <span className="relative size-9 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image src={result.thumbnailUrl} alt="" fill sizes="36px" className="object-cover" />
        </span>
      ) : isCreator ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-bold text-primary">
          {getInitials(result.title)}
        </span>
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <FontAwesomeIcon icon={TYPE_ICON[result.type] ?? faMagnifyingGlass} className="size-3.5" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-medium text-foreground">{result.title}</span>
        {result.subtitle && (
          <span className="truncate text-[11px] text-muted-foreground">{result.subtitle}</span>
        )}
      </span>
      <FontAwesomeIcon
        icon={faArrowRight}
        className="size-3 shrink-0 text-muted-foreground/0 transition-colors group-data-[selected=true]:text-muted-foreground/40"
      />
    </CommandPrimitive.Item>
  )
}

function SkeletonRows() {
  return (
    <div className="space-y-1 p-1" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-1.5 py-2">
          <span className="size-9 shrink-0 animate-pulse rounded-xl bg-muted" />
          <span className="flex flex-1 flex-col gap-1.5">
            <span className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
            <span className="h-2 w-1/3 animate-pulse rounded bg-muted/70" />
          </span>
        </div>
      ))}
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-border bg-background px-1 font-sans text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  )
}

function KbdEnter() {
  return (
    <span className="ml-auto hidden items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground group-data-[selected=true]:flex">
      <FontAwesomeIcon icon={faArrowTurnDown} className="size-2.5 rotate-90" />
      Enter
    </span>
  )
}

/**
 * Shared discovery search. Same UI + behaviour everywhere it's used
 * (learner header + public marketplace header): typing shows live grouped
 * suggestions, ↵ runs a full /explore search, selecting a row deep-links it.
 *
 * Wrapped in Suspense because the inner component reads useSearchParams(),
 * which forces a Suspense boundary during static prerender (Next 16).
 */
export function MarketplaceSearch({
  className,
  placeholder = 'Search creators, courses, topics…',
}: MarketplaceSearchProps) {
  return (
    <Suspense
      fallback={
        <div className={cn('relative', className)}>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60"
          />
          <input
            type="text"
            disabled
            placeholder={placeholder}
            aria-label="Search creators, courses or topics"
            className="h-11 w-full rounded-full border border-border bg-muted/40 pl-11 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/60"
          />
        </div>
      }
    >
      <MarketplaceSearchInner className={className} placeholder={placeholder} />
    </Suspense>
  )
}
