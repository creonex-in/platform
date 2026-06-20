import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/** Matches PayoutsPage: stat panel + KYC banner + earnings card + history card. */
export function PayoutsSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Earnings stat panel — 4 hairline cells */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card p-4 sm:p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-7 w-24" />
              <Skeleton className="mt-2 h-3 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* KYC gate banner */}
      <div className="flex items-center gap-3 rounded-lg border border-border p-4">
        <Skeleton className="size-5 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-8 w-28 shrink-0" />
      </div>

      {/* Earnings + payout history cards */}
      {Array.from({ length: 2 }).map((_, c) => (
        <Card key={c}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            {Array.from({ length: 3 }).map((_, r) => (
              <div key={r} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-4 w-16 shrink-0" />
                <Skeleton className="h-5 w-16 shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
