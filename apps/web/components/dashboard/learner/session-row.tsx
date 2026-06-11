import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faStar } from '@fortawesome/free-solid-svg-icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Purchase } from '@/types/learner'
import { formatCurrency } from '@/lib/utils'

interface SessionRowProps {
  purchase: Purchase
}

export function SessionRow({ purchase }: SessionRowProps): React.ReactElement {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <Avatar className="size-10 shrink-0">
        <AvatarFallback className="bg-muted text-sm font-medium">
          {purchase.creatorInitials}
        </AvatarFallback>
      </Avatar>

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{purchase.offerTitle}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{purchase.creatorName}</span>
          <span className="text-border">·</span>
          <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            <FontAwesomeIcon icon={faCalendar} className="size-3" />
            {purchase.purchasedAt}
          </span>
        </div>
      </div>

      {/* Right cluster — consistent, column-aligned */}
      <div className="flex shrink-0 items-center gap-4">
        {purchase.rated && purchase.rating ? (
          <span className="hidden items-center gap-1 text-xs font-medium text-muted-foreground sm:flex">
            <FontAwesomeIcon icon={faStar} className="size-3 text-amber-400" />
            {purchase.rating.toFixed(1)}
          </span>
        ) : null}

        <span className="hidden w-16 text-right text-sm font-semibold tabular-nums sm:block">
          {formatCurrency(purchase.price)}
        </span>

        <Badge
          variant={purchase.completed ? 'outline' : 'secondary'}
          className="w-20 justify-center"
        >
          {purchase.completed ? 'Done' : 'Upcoming'}
        </Badge>

        {!purchase.rated && purchase.completed ? (
          <Button size="sm" variant="outline">
            Rate
          </Button>
        ) : (
          <div aria-hidden className="hidden w-[3.25rem] sm:block" />
        )}
      </div>
    </div>
  )
}
