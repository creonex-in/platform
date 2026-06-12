import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'
import { getTypeConfig } from './types'
import type { PublicOffering } from '@creonex/types'

export function OfferingCard({ item }: { item: PublicOffering }): React.ReactElement {
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
      'relative flex flex-col rounded-[18px] border border-border bg-card overflow-hidden',
      'hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:border-border/80 transition-all duration-200 cursor-pointer',
      soldOut && 'opacity-60',
    )}>
      {/* Gradient accent strip */}
      <div className={cn('h-[3px] w-full bg-gradient-to-r', cfg.gradient)} />

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Type badge + duration */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            'inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full ring-1',
            cfg.accentBg, cfg.accentText, cfg.accentRing,
          )}>
            <FontAwesomeIcon icon={cfg.icon} className="size-2.5" />
            {cfg.label}
          </span>
          {duration && (
            <span className="flex items-center gap-1 text-[10.5px] text-muted-foreground font-semibold">
              <FontAwesomeIcon icon={faClock} className="size-2.5" />
              {duration}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-[13px] sm:text-[13.5px] font-bold text-foreground leading-snug line-clamp-2 flex-1">
          {item.title}
        </p>

        {/* Status chips */}
        {urgency && (
          <span className="inline-flex w-fit text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-800/60">
            Only {item.seatsRemaining} spots left
          </span>
        )}
        {soldOut && (
          <span className="inline-flex w-fit text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            Sold out
          </span>
        )}

        {/* Price + bookings footer */}
        <div className="pt-2 mt-auto border-t border-border/60 flex items-center justify-between gap-2">
          <div>
            <p className="text-[15px] font-extrabold text-foreground leading-none">
              ₹{item.price.toLocaleString('en-IN')}
            </p>
            {item.totalBookings > 0 && (
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {item.totalBookings} booked
              </p>
            )}
          </div>
          <div className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br shrink-0',
            cfg.gradient,
          )}>
            <FontAwesomeIcon icon={faArrowRight} className="size-3 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
