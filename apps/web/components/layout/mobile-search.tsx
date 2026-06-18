'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command as CommandPrimitive } from 'cmdk'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { addRecentSearch } from '@/hooks/use-recent-searches'
import { SearchPanel } from './search-panel'

/**
 * Mobile search affordance: a search icon that opens a full-screen dialog with
 * the input auto-focused (keyboard opens immediately). Reuses SearchPanel, so
 * suggestions behave exactly like the desktop dropdown. Render with `md:hidden`.
 */
export function MobileSearchTrigger({ className }: { className?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  const goToSearch = useCallback(
    (q: string) => {
      close()
      addRecentSearch(q)
      router.push(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : '/explore')
    },
    [router, close],
  )

  const goToResult = useCallback(
    (href: string) => {
      close()
      router.push(href)
    },
    [router, close],
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={cn(
          'flex size-9 items-center justify-center rounded-full border border-border bg-muted/50 text-foreground transition-colors hover:bg-muted',
          className,
        )}
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="size-[15px]" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="left-0 top-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 ring-0 sm:max-w-none"
        >
          <DialogTitle className="sr-only">Search Creonex</DialogTitle>

          <CommandPrimitive shouldFilter={false} className="flex h-full flex-col">
            {/* Input row */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-3">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="size-4 shrink-0 text-muted-foreground/60" />
              <CommandPrimitive.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search creators, courses, topics…"
                aria-label="Search creators, courses or topics"
                className="h-9 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <FontAwesomeIcon icon={faXmark} className="size-4" />
              </button>
            </div>

            <SearchPanel
              query={query}
              listClassName="flex-1"
              onSearch={goToSearch}
              onResult={goToResult}
              onNiche={(v) => goToResult(`/explore?niche=${v}`)}
            />
          </CommandPrimitive>
        </DialogContent>
      </Dialog>
    </>
  )
}
