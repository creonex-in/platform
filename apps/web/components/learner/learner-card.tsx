'use client'

import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGraduationCap, faCode, faIndianRupeeSign, faDumbbell,
  faPenNib, faLanguage, faBullhorn, faMusic, faLandmark,
  faBrain, faCamera, faFlask, faHouse, faPencil,
  faRobot, faGamepad, faUtensils, faBriefcase,
  faLeaf, faRocket, faStar, faCircleCheck, faArrowRight,
  faVideo, faClock, faFileLines
} from '@fortawesome/free-solid-svg-icons'
import type { ExploreItem } from '@creonex/types'
import { cn, formatCurrency, getInitials } from '@/lib/utils'
import { nicheLabel } from '@/lib/niche'

// Mapping niche values to FontAwesome icons
const NICHE_ICONS: Record<string, any> = {
  cat_mba_prep: faGraduationCap,
  coding_dsa: faCode,
  personal_finance: faIndianRupeeSign,
  fitness_nutrition: faDumbbell,
  design_creative: faPenNib,
  language_learning: faLanguage,
  digital_marketing: faBullhorn,
  music_arts: faMusic,
  upsc_govt_exams: faLandmark,
  mental_wellness: faBrain,
  photography: faCamera,
  science_research: faFlask,
  real_estate: faHouse,
  writing_content: faPencil,
  ai_data_science: faRobot,
  gaming_esports: faGamepad,
  cooking_food: faUtensils,
  interview_prep: faBriefcase,
  ayurveda_yoga: faLeaf,
  startup_product: faRocket,
}

function getNicheIcon(nicheVal?: string | null) {
  if (!nicheVal) return faStar
  return NICHE_ICONS[nicheVal] ?? faStar
}

// Custom Branded Fallback component: dark slate-zinc gradient, category icon in primary color, creator overlay.
export function BrandedFallback({
  niche,
  creatorName,
  creatorPhotoUrl,
}: {
  niche?: string | null
  creatorName?: string | null
  creatorPhotoUrl?: string | null
}) {
  const icon = getNicheIcon(niche)
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-b border-border/10">
      {/* Ghost background icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] scale-150 pointer-events-none">
        <FontAwesomeIcon icon={icon} className="size-32" />
      </div>

      {/* Category Glyphs */}
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/20 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
        <FontAwesomeIcon icon={icon} className="size-6 text-primary" />
      </div>

      {/* Creator Info Tag */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-black/45 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/5">
        {creatorPhotoUrl ? (
          <img
            src={creatorPhotoUrl}
            alt=""
            className="size-5 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="flex size-5 items-center justify-center rounded-full bg-primary text-[8px] font-bold uppercase text-white">
            {getInitials(creatorName)}
          </div>
        )}
        <span className="text-[10px] font-semibold text-white/90 truncate">
          {creatorName ?? 'Creonex Mentor'}
        </span>
      </div>
    </div>
  )
}

function formatScheduledTime(isoStr: string | null): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${dateStr} · ${timeStr.toLowerCase()}`
}
export function CatalogCard({
  item,
  className,
}: {
  item: ExploreItem
  className?: string
}) {
  const hasImage = !!item.thumbnailUrl
  const nicheLabelText = nicheLabel(item.creator.primaryNiche)

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden",
        "rounded-2xl border border-border bg-card shadow-sm",
        "hover:shadow-md transition-all duration-300",
        className
      )}
    >
      {/* Image / Thumbnail Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {hasImage ? (
          <img
            src={item.thumbnailUrl!}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <BrandedFallback
            niche={item.creator.primaryNiche}
            creatorName={item.creator.displayName || item.creator.username}
            creatorPhotoUrl={item.creator.profilePhotoUrl}
          />
        )}

        {/* Live event scheduling overlay */}
        {item.type === 'live_event' && item.scheduledAt && (
          <span className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-md">
            <FontAwesomeIcon icon={faVideo} className="size-2.5 text-primary" />
            {formatScheduledTime(item.scheduledAt)}
          </span>
        )}
      </div>

      {/* Details Area */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 min-w-0 space-y-4">
        <div className="space-y-3">
          {/* Niche Category Label */}
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
            {nicheLabelText || 'General Learning'}
          </div>

          {/* Title */}
          <Link href={`/c/${item.creator.username}`} className="block">
            <h4 className="text-[15px] font-bold text-foreground leading-snug tracking-tight line-clamp-2 hover:text-primary transition-colors min-h-[44px]">
              {item.title}
            </h4>
          </Link>

          {/* Creator Profile */}
          <div className="flex items-center gap-2.5">
            {item.creator.profilePhotoUrl ? (
              <img
                src={item.creator.profilePhotoUrl}
                alt=""
                className="size-6 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase">
                {getInitials(item.creator.displayName || item.creator.username)}
              </div>
            )}
            <span className="text-xs font-semibold text-muted-foreground truncate flex items-center gap-1.5 max-w-[150px]">
              {item.creator.displayName || item.creator.username}
              {item.creator.isVerified && (
                <FontAwesomeIcon icon={faCircleCheck} className="size-3.5 text-primary shrink-0" />
              )}
            </span>
          </div>

          {/* Trust Layer (Stars, Review count, Bookings) */}
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground font-medium">
            {item.creator.rating > 0 ? (
              <>
                <span className="font-bold text-amber-500">{item.creator.rating.toFixed(1)}</span>
                <div className="flex items-center text-amber-400 gap-0.5">
                  <FontAwesomeIcon icon={faStar} className="size-3" />
                </div>
                <span>({item.creator.reviewCount})</span>
                <span>·</span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground/60">New Creator</span>
                <span>·</span>
              </>
            )}
            <span className="text-foreground">
              {item.totalBookings > 0 ? `${item.totalBookings} booked` : '0 booked'}
            </span>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              {item.type === 'live_event' ? 'Seat price' : 'Price'}
            </span>
            <span className="text-lg font-bold text-foreground">
              {item.price > 0 ? formatCurrency(item.price) : 'Free'}
            </span>
          </div>
          <Link
            href={`/c/${item.creator.username}`}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
          >
            {item.type === 'live_event' ? 'Register' : item.type === 'digital' ? 'Get File' : 'Book 1:1'}
            <FontAwesomeIcon icon={faArrowRight} className="size-2.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export function HorizontalListCard({
  item,
  className,
}: {
  item: ExploreItem
  className?: string
}) {
  const hasImage = !!item.thumbnailUrl
  const nicheLabelText = nicheLabel(item.creator.primaryNiche)

  return (
    <article
      className={cn(
        "group relative flex flex-col sm:flex-row overflow-hidden",
        "rounded-2xl border border-border bg-card shadow-sm",
        "hover:shadow-md hover:border-border/80 transition-all duration-300",
        className
      )}
    >
      {/* Left side image */}
      <div className="relative w-full sm:w-[32%] shrink-0 aspect-[16/9] sm:aspect-auto overflow-hidden bg-muted">
        {hasImage ? (
          <img
            src={item.thumbnailUrl!}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
            loading="lazy"
          />
        ) : (
          <BrandedFallback
            niche={item.creator.primaryNiche}
            creatorName={item.creator.displayName || item.creator.username}
            creatorPhotoUrl={item.creator.profilePhotoUrl}
          />
        )}
        {item.type === 'live_event' && item.scheduledAt && (
          <span className="absolute bottom-2.5 left-2.5 bg-black/65 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1 shadow">
            <FontAwesomeIcon icon={faVideo} className="size-2 text-primary" />
            {formatScheduledTime(item.scheduledAt)}
          </span>
        )}
      </div>

      {/* Right side text */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0 space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {nicheLabelText || 'General'}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full whitespace-nowrap">
              {item.type === 'live_event' ? 'Live Workshop' : item.type === 'digital' ? 'Digital Product' : '1:1 Session'}
            </span>
          </div>

          <Link href={`/c/${item.creator.username}`}>
            <h4 className="text-lg font-bold text-foreground leading-snug hover:text-primary transition-colors line-clamp-1">
              {item.title}
            </h4>
          </Link>

          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
              {item.description}
            </p>
          )}

          {/* Creator Profile */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              By <span className="text-foreground hover:underline font-bold">{item.creator.displayName || item.creator.username}</span>
              {item.creator.isVerified && (
                <FontAwesomeIcon icon={faCircleCheck} className="size-3.5 text-primary" />
              )}
            </span>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground font-medium mt-1">
            {item.creator.rating > 0 && (
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faStar} className="size-3 text-amber-500" />
                <span className="font-bold text-foreground">{item.creator.rating.toFixed(1)}</span>
                <span>({item.creator.reviewCount})</span>
              </div>
            )}
            {item.totalBookings > 0 && (
              <span>• {item.totalBookings} learners booked</span>
            )}
            {item.durationMinutes && (
              <span>• {item.durationMinutes} mins</span>
            )}
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="mt-4 pt-3.5 border-t border-border/60 flex items-center justify-between gap-4">
          <span className="text-lg font-bold text-foreground">
            {item.price > 0 ? formatCurrency(item.price) : 'Free'}
          </span>
          <Link
            href={`/c/${item.creator.username}`}
            className="flex items-center gap-1.5 bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground rounded-xl hover:bg-primary/95 transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
          >
            {item.type === 'live_event' ? 'Join Event' : 'Book Session'}
            <FontAwesomeIcon icon={faArrowRight} className="size-2.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
