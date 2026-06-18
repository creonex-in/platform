'use client'

import Image from 'next/image'
import { Command as CommandPrimitive } from 'cmdk'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass, faUser, faGraduationCap, faHashtag, faArrowRight, faArrowTurnDown, faClockRotateLeft,
} from '@fortawesome/free-solid-svg-icons'
import { useSearchSuggestions } from '@/hooks/use-search-suggestions'
import { useRecentSearches } from '@/hooks/use-recent-searches'
import { NICHE_OPTIONS } from '@/constants/onboarding'
import { FEATURED_NICHES } from '@/lib/niche'
import { cn, getInitials } from '@/lib/utils'
import type { SearchResult } from '@/types/search'

const TYPE_ICON: Record<SearchResult['type'], typeof faUser> = {
  creator: faUser,
  course: faGraduationCap,
  category: faHashtag,
  'learning-path': faHashtag,
}

const PER_GROUP_CAP = 4

const FEATURED_NICHE_OPTIONS = NICHE_OPTIONS.filter(
  (n) => (FEATURED_NICHES as readonly string[]).includes(n.value as string),
)

const GROUP_HEADING_CLASS =
  '[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-muted-foreground/60'

function groupResults(results: SearchResult[]) {
  return [
    { key: 'creators', label: 'Creators', items: results.filter((r) => r.type === 'creator').slice(0, PER_GROUP_CAP) },
    { key: 'courses', label: 'Courses', items: results.filter((r) => r.type === 'course').slice(0, PER_GROUP_CAP) },
    { key: 'topics', label: 'Topics', items: results.filter((r) => r.type === 'category').slice(0, PER_GROUP_CAP) },
  ].filter((g) => g.items.length > 0)
}

interface SearchPanelProps {
  query: string
  /** Extra classes for the scroll list (e.g. max-height vs flex-1). */
  listClassName?: string
  onSearch: (q: string) => void
  onResult: (href: string) => void
  onNiche: (niche: string) => void
}

/**
 * The shared suggestions body — rendered inside any cmdk root (the desktop
 * inline dropdown and the mobile full-screen dialog both reuse this). Shows a
 * default "popular + browse" panel until 2+ chars, then live grouped results.
 */
export function SearchPanel({ query, listClassName, onSearch, onResult, onNiche }: SearchPanelProps) {
  const { data: results = [], isLoading } = useSearchSuggestions(query)
  const groups = groupResults(results)
  const hasResults = results.length > 0
  const trimmed = query.trim()
  const isSearching = trimmed.length >= 2

  return (
    <CommandPrimitive.List className={cn('no-scrollbar overflow-y-auto overscroll-contain p-2', listClassName)}>
      {!isSearching ? (
        <DefaultPanel onSearch={onSearch} onNiche={onNiche} />
      ) : isLoading ? (
        <SkeletonRows />
      ) : (
        <>
          {/* "Search for X" — always present + first, so a bare ↵ runs the full search. */}
          <CommandPrimitive.Group>
            <CommandPrimitive.Item
              value={`__search__${trimmed}`}
              onSelect={() => onSearch(query)}
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
                <CommandPrimitive.Group key={group.key} heading={group.label} className={GROUP_HEADING_CLASS}>
                  {group.items.map((r) => (
                    <SuggestionItem key={r.id} result={r} onSelect={() => onResult(r.href)} />
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
              <p className="mt-0.5 text-xs text-muted-foreground">Try a different term or browse by niche.</p>
            </div>
          )}
        </>
      )}
    </CommandPrimitive.List>
  )
}

/** Keyboard-hint footer (desktop dropdown only). */
export function SearchHints() {
  return (
    <div className="flex items-center gap-4 border-t border-border/60 bg-muted/30 px-3.5 py-2 text-[10px] text-muted-foreground/70">
      <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd>to navigate</span>
      <span className="flex items-center gap-1.5"><Kbd>↵</Kbd>to select</span>
      <span className="ml-auto flex items-center gap-1.5"><Kbd>esc</Kbd>to close</span>
    </div>
  )
}

function DefaultPanel({
  onSearch,
  onNiche,
}: {
  onSearch: (q: string) => void
  onNiche: (niche: string) => void
}) {
  const { recent, clear } = useRecentSearches()

  return (
    <>
      {recent.length > 0 && (
        <>
          <CommandPrimitive.Group>
            <div className="flex items-center justify-between px-2.5 pb-1 pt-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
                Recent
              </span>
              <button
                type="button"
                onClick={clear}
                className="text-[11px] font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                Clear
              </button>
            </div>
            {recent.map((term) => (
              <CommandPrimitive.Item
                key={term}
                value={`recent:${term}`}
                onSelect={() => onSearch(term)}
                className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left outline-none transition-colors data-[selected=true]:bg-muted"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="size-3.5" />
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
        </>
      )}

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
        {result.subtitle && <span className="truncate text-[11px] text-muted-foreground">{result.subtitle}</span>}
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
