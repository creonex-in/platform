'use client' // Error components must be Client Components in Next.js

import { useEffect } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateRight, faHouse, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { Button, buttonVariants } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service if configured
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background decorations matching the premium UI aesthetic */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 blur-[100px] pointer-events-none">
        <div className="h-72 w-72 rounded-full bg-destructive/30" />
        <div className="h-72 w-72 rounded-full bg-purple-500/20 -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="z-10 flex w-full max-w-lg flex-col items-center px-6 text-center animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-8">
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-linear-to-b from-destructive/20 to-destructive/5 shadow-2xl shadow-destructive/10 border border-destructive/20">
          <FontAwesomeIcon icon={faTriangleExclamation} className="size-16 text-destructive drop-shadow-md" />
        </div>
        
        <span className="mb-4 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
          Error 500
        </span>
        
        <h1 className="mb-3 font-display text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
          Something went wrong
        </h1>
        
        <p className="mb-8 text-sm sm:text-base text-muted-foreground leading-relaxed">
          An unexpected error occurred while processing your request. Our team has been notified and we&apos;re looking into it.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => reset()} 
            size="lg" 
            className="w-full sm:w-auto min-w-35 rounded-full shadow-lg shadow-destructive/20"
          >
            <FontAwesomeIcon icon={faRotateRight} className="mr-2 size-4" />
            Try again
          </Button>
          <Link 
            href="/"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "w-full sm:w-auto min-w-35 rounded-full border-border/60 bg-background/50 backdrop-blur-md"
            })}
          >
            <FontAwesomeIcon icon={faHouse} className="mr-2 size-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
