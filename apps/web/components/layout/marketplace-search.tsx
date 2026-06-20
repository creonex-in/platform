'use client'

import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Command as CommandPrimitive } from 'cmdk'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'
import { addRecentSearch } from '@/hooks/use-recent-searches'
import { SearchPanel, SearchHints } from './search-panel'

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
      addRecentSearch(q)
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
    <CommandPrimitive ref={wrapperRef} shouldFilter={false} className={cn('relative', className)}>
      {/* Input */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className={cn(
            'pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 transition-colors duration-200',
            open ? 'text-foreground' : 'text-muted-foreground',
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
            'h-11 w-full rounded-xl border border-border bg-background pl-11 pr-10 text-[15px] text-foreground shadow-sm',
            'transition-all duration-200 placeholder:text-muted-foreground/60',
            'hover:border-border/80 hover:bg-muted/30 hover:shadow',
            'focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary',
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
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
          <SearchPanel
            query={query}
            listClassName="max-h-[22rem]"
            onSearch={goToSearch}
            onResult={goToResult}
            onNiche={(v) => goToResult(`/explore?niche=${v}`)}
          />
          <SearchHints />
        </div>
      )}
    </CommandPrimitive>
  )
}

/**
 * Shared discovery search (desktop inline). Typing shows live grouped
 * suggestions; ↵ runs a full /explore search; a row deep-links it. Wrapped in
 * Suspense because the inner component reads useSearchParams() (Next 16).
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
            className="h-11 w-full rounded-xl border border-border bg-background pl-11 pr-10 text-[15px] text-foreground shadow-sm placeholder:text-muted-foreground/60"
          />
        </div>
      }
    >
      <MarketplaceSearchInner className={className} placeholder={placeholder} />
    </Suspense>
  )
}
