import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { cn, formatCurrency } from '@/lib/utils'
import { CreatorAvatar } from './session-card'

export interface LiveWorkshopCardProps {
  id: string
  creator: { name: string; username: string; title?: string; avatarUrl?: string | null }
  title: string
  seatsFilled: number
  seatsTotal: number
  price: number
  startsInLabel: string
  countdownLabel?: string
  href: string
  className?: string
}

export function LiveWorkshopCard({
  creator,
  title,
  seatsFilled,
  seatsTotal,
  price,
  startsInLabel,
  countdownLabel,
  href,
  className,
}: LiveWorkshopCardProps) {
  const seatsLeft = seatsTotal - seatsFilled
  const pctFilled = Math.round((seatsFilled / seatsTotal) * 100)

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-4xl bg-foreground p-6',
        'shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out',
        'hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.45)]',
        className,
      )}
    >
      {/* LIVE badge + title */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-destructive">
          <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
          Live
        </span>
        <h2 className="mt-4 text-[22px] font-bold leading-tight tracking-tight text-background">
          {title}
        </h2>
      </div>

      {/* Countdown — visual hero */}
      {countdownLabel && (
        <div className="my-5 border-y border-background/10 py-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-background/30">
            hrs · min · sec
          </p>
          <p className="mt-1.5 font-mono text-3xl font-bold tracking-widest text-background">
            {countdownLabel}
          </p>
          <p className="mt-1.5 text-[12px] text-background/40">{startsInLabel}</p>
        </div>
      )}

      {/* Creator + seat progress */}
      <div className="flex flex-1 flex-col justify-end gap-5">
        {/* Creator */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-0.5 ring-1 ring-background/10">
            <CreatorAvatar name={creator.name} src={creator.avatarUrl} size="sm" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-background/80">{creator.name}</p>
            {creator.title && (
              <p className="text-[11px] text-background/35">{creator.title}</p>
            )}
          </div>
        </div>

        {/* Seat bar */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="text-background/35">{seatsFilled} / {seatsTotal} seats</span>
            <span className="font-medium text-background/60">
              {seatsLeft > 0 ? `${seatsLeft} left` : 'Full'}
            </span>
          </div>
          <div className="h-px w-full overflow-hidden rounded-full bg-background/10">
            <div
              className="h-full rounded-full bg-background/30 transition-all duration-700"
              style={{ width: `${pctFilled}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-[11px] text-background/30">Starting at</p>
            <p className="text-2xl font-bold tracking-tight text-background">
              {formatCurrency(price)}
            </p>
          </div>
          <Link
            href={href}
            className="group/btn flex items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-95"
          >
            Book Now
            <FontAwesomeIcon
              icon={faArrowRight}
              className="size-3 transition-transform group-hover/btn:translate-x-1"
            />
          </Link>
        </div>
      </div>

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/20 blur-3xl transition-opacity duration-500 group-hover:opacity-60" />
    </article>
  )
}
