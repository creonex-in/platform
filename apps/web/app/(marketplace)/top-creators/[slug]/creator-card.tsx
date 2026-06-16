'use client'

import Image from 'next/image'
import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faUsers, faArrowRight, faBolt } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import type { Creator } from '@/types/creator'
import { formatFollowers, formatCurrency, cn } from '@/lib/utils'
import { getCQSBadgeVariant } from '@/lib/cqs'

interface CreatorWithImage extends Creator {
  imageUrl: string
}

interface Props {
  creator: CreatorWithImage
  index: number
  pageSize: number
}

export default function CreatorCard({ creator, index, pageSize }: Props): React.ReactElement {
  const badgeVariant = getCQSBadgeVariant(creator.cqsTier)

  // Premium Mouse-tracking Spotlight Effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.4,
        delay: index < pageSize ? Math.min(index, 5) * 0.05 : 0,
        ease: [0.16, 1, 0.3, 1], // Custom premium ease-out
      }}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card p-3 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_32px_64px_-16px_rgba(var(--primary-rgb),0.08)]"
    >
      <Link href={`/${creator.username}`} className="absolute inset-0 z-20">
        <span className="sr-only">View {creator.name}&apos;s profile</span>
      </Link>

      {/* Interactive Background Spotlight Radial Gradient */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              color-mix(in oklch, var(--color-primary) 8%, transparent),
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative">
        {/* Frame Photo Layer with fixed container aspects */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={creator.imageUrl}
            alt={creator.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            priority={index < 3}
          />

          {/* Luxury Minimal Vignette Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

          {/* Premium Status Pill Badges */}
          {/* <div className="absolute inset-x-3 top-3 flex items-center justify-between">
            {creator.isLive ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-md border border-white/10">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-red-500" />
                </span>
                <span className="text-[9px] font-bold tracking-[0.08em] text-white">LIVE</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-md border border-white/5 text-[9px] font-medium text-white/70">
                <FontAwesomeIcon icon={faBolt} className="size-2 text-primary" />
                <span>Available</span>
              </div>
            )}

            <Badge
              variant={badgeVariant}
              className="rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md border border-white/10 shadow-xs"
            >
              CQS {creator.cqsScore}
            </Badge>
          </div> */}

          {/* Floating Base Context Info Layer */}
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
            <div className="space-y-0.5">
              <h3 className="font-display text-[15px] font-bold tracking-tight text-white line-clamp-1">
                {creator.name}
              </h3>
              <p className="text-[11px] font-medium text-white/60 line-clamp-1">
                {creator.niche}
              </p>
            </div>

            {/* Minimal Price Tag Over Backdrop */}
            <div className="rounded-md bg-white/10 px-2 py-1 backdrop-blur-md border border-white/10 text-xs font-bold text-white tracking-tight">
              {formatCurrency(creator.sessionPrice)}
            </div>
          </div>
        </div>

        {/* Dynamic Inner Summary Metrics Grid */}
        <div className="mt-3.5 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <FontAwesomeIcon icon={faStar} className="size-3 text-amber-400/90" />
              <span className="font-bold text-foreground">{creator.rating.toFixed(1)}</span>
            </div>
            <div className="h-3 w-px bg-border/60" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <FontAwesomeIcon icon={faUsers} className="size-3 opacity-70" />
              <span>{formatFollowers(creator.followers)}</span>
            </div>
          </div>

          <div
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3.5 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-xs transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground"
          >
            Open
            <FontAwesomeIcon
              icon={faArrowRight}
              className="size-2.5 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}