import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'
import { getTypeConfig } from './types'
import type { PublicOffering } from '@creonex/types'

export function OfferingCard({ item, onBook }: { item: PublicOffering; onBook?: () => void }): React.ReactElement {
  const cfg = getTypeConfig(item.type)

  const duration = item.durationMinutes
    ? item.durationMinutes >= 60
      ? `${item.durationMinutes / 60}h`
      : `${item.durationMinutes} min`
    : null

  const hasSeats = item.seatsRemaining != null
  const urgency = hasSeats && item.seatsRemaining! <= 3 && item.seatsRemaining! > 0
  const soldOut = hasSeats && item.seatsRemaining === 0

  return (
    <div className={cn(
      'relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden',
      'transition-all duration-200',
      soldOut && 'opacity-60',
      onBook && !soldOut && (item.type === 'one_on_one' || item.type === 'group') && 'cursor-pointer hover:shadow-md hover:border-primary/40',
    )}>
      {/* Gradient accent strip */}
      <div className={cn('h-1 w-full bg-linear-to-r', cfg.gradient)} />

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Type badge + duration */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            'inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ring-1',
            cfg.accentBg, cfg.accentText, cfg.accentRing,
          )}>
            <FontAwesomeIcon icon={cfg.icon} className="size-2.5" />
            {cfg.label}
          </span>
          {duration && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
              <FontAwesomeIcon icon={faClock} className="size-2.5" />
              {duration}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-bold text-foreground leading-snug line-clamp-2 flex-1">
          {item.title}
        </p>

        {/* Status chips */}
        {urgency && (
          <span className="inline-flex w-fit text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            Only {item.seatsRemaining} spots left
          </span>
        )}
        {soldOut && (
          <span className="inline-flex w-fit text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            Sold out
          </span>
        )}

        {/* Price + bookings footer */}
        <div className="pt-2 mt-auto border-t border-border/60 flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-extrabold text-foreground leading-none">
              ₹{item.price.toLocaleString('en-IN')}
            </p>
            {item.totalBookings > 0 && (
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {item.totalBookings} booked
              </p>
            )}
          </div>
          {onBook && !soldOut && (item.type === 'one_on_one' || item.type === 'group') ? (
            <button
              onClick={onBook}
              className="rounded-full bg-primary text-primary-foreground text-xs font-bold px-4 py-2 hover:bg-primary/90 active:scale-95 transition-all"
            >
              Book
            </button>
          ) : (
            <span className="text-[10px] font-semibold text-muted-foreground/60 italic">
              Coming soon
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
