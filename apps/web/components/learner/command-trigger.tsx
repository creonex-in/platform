'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { openCommandPalette } from './command-palette'

/** Opens the command palette. Desktop shows a ⌘K pill; mobile shows a search icon. */
export function CommandTrigger(): React.ReactElement {
  return (
    <>
      {/* Desktop pill */}
      <button
        type="button"
        onClick={openCommandPalette}
        className="hidden w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:border-primary/30 hover:shadow-xs md:flex"
      >
        <div className="flex items-center gap-2.5">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="size-3.5 text-muted-foreground/85" />
          <span>Search dashboard, schedule, library...</span>
        </div>
        <kbd className="pointer-events-none select-none rounded bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground/80 ring-1 ring-border">⌘K</kbd>
      </button>
      {/* Mobile icon */}
      <button
        type="button"
        onClick={openCommandPalette}
        aria-label="Search"
        className="flex size-9 items-center justify-center rounded-full border border-border bg-muted/50 text-foreground transition-colors hover:bg-muted md:hidden"
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="size-[15px]" />
      </button>
    </>
  )
}
