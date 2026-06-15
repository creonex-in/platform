'use client'

import { useRouter } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faMagnifyingGlass, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DashboardTopbarProps {
  title: string
  action?: React.ReactNode
  showSearch?: boolean
  searchPlaceholder?: string
}

export function DashboardTopbar({
  title,
  action,
  showSearch = false,
  searchPlaceholder = 'Search experts, courses, workshops…',
}: DashboardTopbarProps): React.ReactElement {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function submit(e: React.FormEvent): void {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/learner/search?q=${encodeURIComponent(q)}` : '/learner/search')
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-3 sm:gap-3 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <h1 className="shrink-0 font-display text-base font-semibold tracking-tight">{title}</h1>

      {showSearch && (
        <form onSubmit={submit} className="relative mx-auto hidden w-full max-w-md md:block">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 rounded-full pl-9"
          />
        </form>
      )}

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {action}
        {showSearch && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 md:hidden"
            onClick={() => router.push('/learner/search')}
            aria-label="Search"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="size-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="size-8" aria-label="Notifications">
          <FontAwesomeIcon icon={faBell} className="size-4" />
        </Button>
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="size-4" />
          </Button>
        )}
      </div>
    </header>
  )
}
