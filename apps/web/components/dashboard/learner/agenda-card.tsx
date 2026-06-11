import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faClock,
  faVideo,
  faUsers,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AgendaItem, AgendaKind } from '@/types/learner'

const kindMeta: Record<AgendaKind, { label: string; icon: IconDefinition }> = {
  session: { label: '1:1 Session', icon: faVideo },
  workshop: { label: 'Workshop', icon: faCalendarDays },
  group: { label: 'Group', icon: faUsers },
}

export function AgendaCard({ item }: { item: AgendaItem }): React.ReactElement {
  const meta = kindMeta[item.kind]

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary" className="gap-1.5 tracking-wide">
          <FontAwesomeIcon icon={meta.icon} className="size-3" />
          {meta.label}
        </Badge>
        {typeof item.seatsLeft === 'number' && item.seatsLeft <= 5 && (
          <Badge variant="destructive" className="tracking-wide">
            {item.seatsLeft} seats left
          </Badge>
        )}
      </div>

      <p className="text-base font-semibold leading-relaxed text-foreground">{item.title}</p>

      <div className="flex items-center gap-2.5">
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-muted text-xs font-medium">
            {item.hostInitials}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-sm text-muted-foreground">{item.host}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendarDays} className="size-3.5" />
          {item.date}
        </span>
        {item.duration ? (
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faClock} className="size-3.5" />
            {item.duration} min
          </span>
        ) : null}
      </div>

      <Link href={item.href} className={cn(buttonVariants({ size: 'sm' }), 'mt-auto w-full')}>
        {item.kind === 'session' ? 'Join session' : 'View details'}
        <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 size-3.5" />
      </Link>
    </div>
  )
}
