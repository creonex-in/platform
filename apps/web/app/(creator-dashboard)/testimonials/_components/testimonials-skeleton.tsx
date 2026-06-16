export function TestimonialsSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 animate-pulse">
        <div className="h-4 w-48 bg-muted rounded mb-1" />
        <div className="h-3 w-64 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-2.5 w-16 bg-muted rounded" />
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <div key={s} className="size-3 bg-muted rounded" />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-4/5 bg-muted rounded" />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-5 w-9 bg-muted rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
