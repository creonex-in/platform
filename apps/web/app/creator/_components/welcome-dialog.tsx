'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket, faArrowRight, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface Props {
  offerId: string
  username?: string
}

/** Post-onboarding welcome — opens once on /dashboard?welcome=1&offer=<id>. */
export function WelcomeDialog({ offerId, username }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  const close = () => {
    setOpen(false)
    // Drop the query so it doesn't reopen on refresh / back.
    router.replace('/creator', { scroll: false })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close() }}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl sm:max-w-md"
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-linear-to-br from-primary/15 via-card to-card px-8 pt-10 pb-7 text-center">
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 size-44 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <FontAwesomeIcon icon={faRocket} className="size-7" />
          </div>
          <h2 className="relative font-display text-2xl font-bold tracking-tight text-foreground">You&apos;re live!</h2>
          <p className="relative mt-2 text-sm text-muted-foreground">
            Your first offering is published and ready for bookings. Make it shine before you share it.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 px-6 pb-6 pt-2">
          <Link
            href={`/offers/${offerId}/edit`}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10"
          >
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">Polish your offering</p>
              <p className="text-xs text-muted-foreground">Add a description, photo, pricing &amp; booking rules.</p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5">
              <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
            </span>
          </Link>

          {username && (
            <a
              href={`/c/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">View your public page</p>
                <p className="truncate text-xs text-muted-foreground">creonex.in/c/{username}</p>
              </div>
              <FontAwesomeIcon icon={faUpRightFromSquare} className="size-3.5 shrink-0 text-muted-foreground" />
            </a>
          )}

          <button
            onClick={close}
            className="mt-1 h-10 cursor-pointer rounded-xl text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore my dashboard
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
