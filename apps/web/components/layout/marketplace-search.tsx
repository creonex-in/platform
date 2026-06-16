'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

interface MarketplaceSearchProps {
  /** Extra classes for the wrapping <form> (width, visibility, etc.). */
  className?: string
  placeholder?: string
}

/**
 * Shared discovery search. Same UI + behaviour everywhere it's used
 * (learner header + public marketplace header): submit routes to
 * /explore?q=… and the input pre-fills from the current ?q= param.
 */
export function MarketplaceSearch({
  className,
  placeholder = 'Explore Creators or Offerings',
}: MarketplaceSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  function submit(e: React.FormEvent): void {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore')
  }

  return (
    <form onSubmit={submit} className={cn('relative', className)}>
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        className="pointer-events-none absolute left-4 top-1/2 size-[14px] -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search creators or offerings"
        className="h-[38px] w-full rounded-full border border-border bg-muted/60 pl-10 pr-4 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground hover:bg-muted focus:border-primary/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </form>
  )
}
