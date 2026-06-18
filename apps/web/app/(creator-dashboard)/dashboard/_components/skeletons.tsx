import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/** Matches WelcomeHero: rounded-2xl card, avatar + greeting + actions. */
export function HeroSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full sm:size-16" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}

/** Matches StatPanel: rounded-xl bordered hairline grid, 4 cells. */
export function StatPanelSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card p-4 sm:p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Matches a Card with header + body of the given content height. */
export function CardSkeleton({ bodyHeight = 'h-48' }: { bodyHeight?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`w-full ${bodyHeight}`} />
      </CardContent>
    </Card>
  )
}

/** Matches ChartsRow: two side-by-side chart cards. */
export function ChartsRowSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}

/** Matches TodaySessionStrip: card header + a couple of session rows. */
export function TodayStripSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/** Matches ActivityFeed: card header + list rows. */
export function ActivityFeedSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-start gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/**
 * Above-the-fold composite — hero + today strip + quick stats. One coherent
 * frame so the top of the dashboard appears as a unit, not piece-by-piece.
 */
export function AboveFoldSkeleton() {
  return (
    <div className="space-y-6">
      <HeroSkeleton />
      <TodayStripSkeleton />
      <StatPanelSkeleton />
    </div>
  )
}

/** Below-the-fold composite — charts row + earnings card + activity feed. */
export function BelowFoldSkeleton() {
  return (
    <div className="space-y-6">
      <ChartsRowSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CardSkeleton bodyHeight="h-40" />
        <div className="lg:col-span-2">
          <ActivityFeedSkeleton />
        </div>
      </div>
    </div>
  )
}
