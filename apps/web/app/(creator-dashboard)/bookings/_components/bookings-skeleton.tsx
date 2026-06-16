export function BookingsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 rounded-lg border border-border bg-card animate-pulse" />
      ))}
    </div>
  )
}
