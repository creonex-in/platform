import { Card, CardContent, CardHeader } from '@/components/ui/card'

const bar = 'animate-pulse rounded bg-muted'

/** Matches WelcomeHero: rounded-2xl card, avatar + greeting + actions. */
export function HeroSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={`size-14 shrink-0 rounded-full ${bar} sm:size-16`} />
          <div className="space-y-2">
            <div className={`h-7 w-48 ${bar}`} />
            <div className={`h-4 w-64 ${bar}`} />
          </div>
        </div>
        <div className="flex gap-2">
          <div className={`h-8 w-24 ${bar}`} />
          <div className={`h-8 w-24 ${bar}`} />
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
            <div className={`h-3 w-20 ${bar}`} />
            <div className={`mt-3 h-7 w-16 ${bar}`} />
            <div className={`mt-2 h-3 w-24 ${bar}`} />
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
        <div className={`h-4 w-32 ${bar}`} />
      </CardHeader>
      <CardContent>
        <div className={`w-full ${bar} ${bodyHeight}`} />
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
        <div className={`h-4 w-36 ${bar}`} />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className={`size-10 shrink-0 rounded-full ${bar}`} />
              <div className="space-y-2">
                <div className={`h-4 w-40 ${bar}`} />
                <div className={`h-3 w-28 ${bar}`} />
              </div>
            </div>
            <div className={`h-8 w-16 ${bar}`} />
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
        <div className={`h-4 w-32 ${bar}`} />
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className={`size-8 shrink-0 rounded-full ${bar}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 w-3/4 ${bar}`} />
                <div className={`h-3 w-20 ${bar}`} />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
