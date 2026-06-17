import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { cn, formatCurrency } from '@/lib/utils'
import { CreatorAvatar } from './session-card'

export interface DigitalAssetCardProps {
  id: string
  creator: { name: string; username: string; title: string; avatarUrl?: string | null }
  bio: string
  assetName: string
  assetType: string
  price: number
  href: string
  className?: string
}

export function DigitalAssetCard({
  creator,
  bio,
  assetName,
  assetType,
  price,
  href,
  className,
}: DigitalAssetCardProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden',
        'rounded-4xl border border-border bg-card p-6',
        'shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] transition-all duration-500 ease-out',
        'hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)]',
        className,
      )}
    >
      {/* Top */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl p-0.5 ring-1 ring-border">
            <CreatorAvatar name={creator.name} src={creator.avatarUrl} size="md" />
          </div>
          <div>
            <h4 className="text-[15px] font-semibold text-foreground">{creator.name}</h4>
            <p className="text-[13px] text-muted-foreground">{creator.title}</p>
          </div>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
          {assetType}
        </span>
      </div>

      {/* Middle */}
      <div className="my-5">
        <h2 className="mb-3 text-[22px] font-bold leading-tight tracking-tight text-foreground">
          {assetName}
        </h2>
        <p className="line-clamp-3 text-[14px] leading-relaxed text-muted-foreground">{bio}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/50 pt-4">
        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-muted-foreground/60">Starting at</span>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(price)}
          </span>
        </div>
        <Link
          href={href}
          className="group/btn flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-80 active:scale-95"
        >
          View Asset
          <FontAwesomeIcon
            icon={faArrowRight}
            className="size-3 transition-transform group-hover/btn:translate-x-1"
          />
        </Link>
      </div>

      {/* Decorative corner */}
      <div className="absolute -right-6 -top-6 size-24 rounded-full bg-muted/50 transition-transform duration-500 group-hover:scale-110" />
    </article>
  )
}
