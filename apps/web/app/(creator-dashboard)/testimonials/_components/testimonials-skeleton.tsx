import { Skeleton } from '@/components/ui/skeleton'

export function TestimonialsSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
        <Skeleton className="mb-1 h-4 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Skeleton key={s} className="size-3" />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
