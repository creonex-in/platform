'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'

/**
 * Inline theme toggle sized to sit in a header row.
 * (The global ThemeToggle is `position: fixed` and can't be used in flow.)
 */
export function ThemeToggleInline({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`flex size-9 items-center justify-center rounded-full border border-border bg-muted/50 text-foreground transition-colors hover:bg-muted ${className}`}
    >
      {/* Render nothing until mounted to avoid SSR/client icon mismatch */}
      {mounted && (
        <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="size-[15px]" />
      )}
    </button>
  )
}
