import { getCreatorDashboardSummary } from '@/dal/dashboard.dal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo, faCalendarDays, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { CreatorBookingItem } from '@creonex/types'

function formatSessionTime(startTime: string | null, endTime: string | null): string {
  if (!startTime) return 'Time TBD'
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : null
  const fmt = (d: Date) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start)
}

function formatSessionDate(startTime: string): string {
  const d = new Date(startTime)
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

function isJoinActive(startTime: string | null): boolean {
  if (!startTime) return false
  const diff = new Date(startTime).getTime() - Date.now()
  return diff <= 15 * 60 * 1000 && diff >= -60 * 60 * 1000
}

function SessionCard({ session, isNext = false }: { session: CreatorBookingItem; isNext?: boolean }) {
  const active = isJoinActive(session.startTime)
  const timeLabel = formatSessionTime(session.startTime, session.endTime)

  return (
    <div className={cn(
      'flex items-center justify-between gap-4 rounded-lg border p-4',
      active ? 'border-primary/40 bg-primary/5' : 'border-border bg-card',
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        )}>
          <FontAwesomeIcon icon={faVideo} className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{session.offeringTitle}</p>
          <p className="text-xs text-muted-foreground">
            {isNext && session.startTime
              ? formatSessionDate(session.startTime) + ' · '
              : ''}
            {timeLabel} · {session.learnerName}
          </p>
        </div>
      </div>
      {session.meetingUrl && (
        <Link
          href={session.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ size: 'sm', variant: active ? 'default' : 'outline' }),
            'shrink-0',
          )}
        >
          Join
          <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 size-3" />
        </Link>
      )}
    </div>
  )
}

export async function TodaySessionStrip() {
  const data = await getCreatorDashboardSummary()
  if (!data) return null

  const { todaySessions, nextSession } = data

  if (todaySessions.length === 0 && !nextSession) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 py-5 text-muted-foreground">
          <FontAwesomeIcon icon={faCalendarDays} className="size-5 shrink-0" />
          <p className="text-sm">No sessions today — share your profile to get bookings.</p>
        </CardContent>
      </Card>
    )
  }

  if (todaySessions.length === 0 && nextSession) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FontAwesomeIcon icon={faCalendarDays} className="size-4" />
            No sessions today — next session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SessionCard session={nextSession} isNext />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FontAwesomeIcon icon={faCalendarDays} className="size-4 text-primary" />
          {"Today's sessions"}
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todaySessions.map((s: CreatorBookingItem) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </CardContent>
    </Card>
  )
}
