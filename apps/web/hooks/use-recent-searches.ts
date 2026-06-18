'use client'

import { useCallback, useEffect, useState } from 'react'

const KEY = 'creonex:recent-searches'
const MAX = 6

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function write(list: string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable (private mode / quota) — recent search is best-effort */
  }
}

/** Record a committed search query. Most-recent first, deduped, capped at MAX. */
export function addRecentSearch(query: string): void {
  const term = query.trim()
  if (!term) return
  const next = [term, ...read().filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, MAX)
  write(next)
}

export function clearRecentSearches(): void {
  write([])
}

/**
 * Reads the recent-search history from localStorage. SSR-safe: starts empty and
 * hydrates on mount (no hydration mismatch). Re-reads each mount, so the list is
 * fresh every time the search panel opens.
 */
export function useRecentSearches(): { recent: string[]; clear: () => void } {
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    setRecent(read())
  }, [])

  const clear = useCallback(() => {
    clearRecentSearches()
    setRecent([])
  }, [])

  return { recent, clear }
}
