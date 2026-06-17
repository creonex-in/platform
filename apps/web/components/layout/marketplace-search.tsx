'use client'

import { Suspense, useState } from 'react'
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
const INPUT_CLASS =
  'h-[38px] w-full rounded-full border border-border bg-muted/60 pl-10 pr-4 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground hover:bg-muted focus:border-primary/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20'

function MarketplaceSearchInner({ className, placeholder }: MarketplaceSearchProps) {
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
        className={INPUT_CLASS}
      />
    </form>
  )
}

/**
 * Shared discovery search. Same UI + behaviour everywhere it's used
 * (learner header + public marketplace header): submit routes to
 * /explore?q=… and the input pre-fills from the current ?q= param.
 *
 * Wrapped in Suspense because the inner component reads useSearchParams(),
 * which forces a Suspense boundary during static prerender (Next 16).
 */
export function MarketplaceSearch({
  className,
  placeholder = 'Explore Creators or Offerings',
}: MarketplaceSearchProps) {
  return (
    <Suspense
      fallback={
        <div className={cn('relative', className)}>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-4 top-1/2 size-[14px] -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            disabled
            placeholder={placeholder}
            aria-label="Search creators or offerings"
            className={INPUT_CLASS}
          />
        </div>
      }
    >
      <MarketplaceSearchInner className={className} placeholder={placeholder} />
    </Suspense>
  )
}
