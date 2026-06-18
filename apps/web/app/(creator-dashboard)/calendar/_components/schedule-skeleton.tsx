import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ScheduleSkeleton() {
  return (
    <>
      {/* Mirrors the builder's sticky action bar so there's no jump on swap */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-3">
      {/* Weekly card */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-48 mt-1" />
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <div className="flex w-36 items-center gap-2.5">
                <Skeleton className="h-5 w-9 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  )
}
