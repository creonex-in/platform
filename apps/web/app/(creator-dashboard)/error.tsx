'use client' // Error components must be Client Components in Next.js

import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateRight, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'

/**
 * Segment-level boundary for the creator dashboard. A failed DAL call inside a
 * page's streamed content lands here instead of the global error page, so the
 * sidebar + dashboard chrome stay intact and the creator can retry in place.
 */
export default function CreatorDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): React.ReactElement {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10">
        <FontAwesomeIcon icon={faTriangleExclamation} className="size-7 text-destructive" />
      </div>
      <h2 className="mb-2 font-display text-xl font-semibold tracking-tight text-foreground">
        Couldn&apos;t load this page
      </h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Something went wrong while fetching your data. This is usually temporary —
        try again.
      </p>
      <Button onClick={() => reset()} size="sm" className="rounded-full">
        <FontAwesomeIcon icon={faRotateRight} className="mr-2 size-3.5" />
        Try again
      </Button>
    </div>
  )
}
