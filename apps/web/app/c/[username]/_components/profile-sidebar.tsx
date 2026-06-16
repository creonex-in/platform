'use client'

import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faCheck,
  faAward,
  faEnvelope,
  faGlobe,
  faBolt
} from '@fortawesome/free-solid-svg-icons'
import {
  faLinkedin,
  faXTwitter,
  faYoutube,
  faInstagram
} from '@fortawesome/free-brands-svg-icons'
import { getInitials } from '@/lib/utils'
import type { PublicCreatorProfile } from '@creonex/types'

interface ProfileSidebarProps {
  profile: PublicCreatorProfile
  displayName: string
  onBook?: () => void
  /** Read-only preview: CTAs render but don't act. */
  preview?: boolean
}

function getResponseTime(tier: string): string {
  if (tier === 'featured') return 'Responds in a few hours'
  if (tier === 'verified') return 'Responds within 24 hours'
  return 'Responds within 48 hours'
}

export function ProfileSidebar({ profile, displayName, onBook, preview = false }: ProfileSidebarProps) {
  const initials = getInitials(displayName)
  
  // Format niche nicely or fallback
  const nicheLabel = profile.primaryNiche
    ? profile.primaryNiche.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Professional Creator'

  const socialEntries = Object.entries(profile.socialLinks ?? {}).filter(
    ([, v]) => typeof v === 'string' && (v as string).length > 0,
  ) as [string, string][]

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Main Profile Info Card */}
      <div className="relative rounded-2xl border border-border/80 bg-card p-6 sm:p-8 md:p-9 shadow-lg text-center -mt-16 sm:-mt-24 md:-mt-28 relative z-10 overflow-hidden">
        {/* Subtle top background highlight */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

        {/* Rank/Tier Badge */}
        {profile.qualityTier && profile.qualityTier !== 'new' && (
          <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-5 shadow-sm uppercase tracking-wider">
            <FontAwesomeIcon icon={faAward} className="size-3.5" />
            <span>
              {profile.qualityTier === 'platinum' ? 'Elite Creator' :
               profile.qualityTier === 'gold' ? 'Pro Creator' :
               profile.qualityTier === 'silver' ? 'Rising Star' : 'Featured'}
            </span>
          </div>
        )}

        {/* Avatar */}
        <div className="mx-auto size-32 sm:size-36 rounded-full border-[6px] border-card shadow-md bg-muted overflow-hidden relative mb-6 transition-transform hover:scale-[1.02] duration-300">
          {profile.profilePhotoUrl ? (
            <Image
              src={profile.profilePhotoUrl}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 120px, 136px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-3xl">
              {initials}
            </div>
          )}
        </div>

        {/* Name with Verified Check */}
        <div className="flex items-center justify-center gap-1.5 mb-2.5 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-display leading-tight">
            {displayName}
          </h2>
          {profile.isVerified && (
            <span className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full size-5 shrink-0 shadow-sm" title="Verified Creator">
              <FontAwesomeIcon icon={faCheck} className="size-2.5" />
            </span>
          )}
        </div>

        {/* Niche / Role Title */}
        <p className="text-sm text-muted-foreground font-semibold leading-normal mb-3 px-1">
          {nicheLabel} {profile.experienceYears ? `· ${profile.experienceYears}+ yrs` : ''}
        </p>

        {/* Social Links Row */}
        {socialEntries.length > 0 && (
          <div className="flex items-center justify-center gap-2.5 mb-6 flex-wrap">
            {socialEntries.map(([key, url]) => {
              const icon = key === 'linkedin' ? faLinkedin :
                           key === 'twitter' ? faXTwitter :
                           key === 'website' ? faGlobe :
                           key === 'youtube' ? faYoutube :
                           key === 'instagram' ? faInstagram : faGlobe
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center size-8 rounded-full border border-border/80 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                >
                  <FontAwesomeIcon icon={icon} className="size-3.5" />
                </a>
              )
            })}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-4 border-y border-border/60 mb-6">
          <div className="border-r border-border/60 last:border-r-0">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Sessions</p>
            <p className="text-base font-extrabold text-foreground leading-none">{profile.totalSessions}</p>
          </div>
          <div className="border-r border-border/60 last:border-r-0">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Reviews</p>
            <p className="text-base font-extrabold text-foreground leading-none">{profile.totalReviews}</p>
          </div>
          <div className="last:border-r-0">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Rating</p>
            <p className="text-base font-extrabold text-foreground leading-none">
              {parseFloat(profile.smoothedRating) > 0 ? parseFloat(profile.smoothedRating).toFixed(1) : '—'}
            </p>
          </div>
        </div>

        {/* Spoken Languages & Response Speeds */}
        <div className="flex flex-col gap-2.5 mb-8 text-left text-xs text-muted-foreground/95 font-medium border-b border-border/60 pb-6">
          {profile.languages && profile.languages.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground/50 font-semibold">Languages</span>
              <span className="font-semibold text-foreground truncate max-w-[150px]">{profile.languages.join(', ')}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground/50 font-semibold">Replies</span>
            <span className="font-bold text-primary flex items-center gap-1">
              <FontAwesomeIcon icon={faBolt} className="size-3 text-primary animate-pulse" />
              <span>{getResponseTime(profile.qualityTier)}</span>
            </span>
          </div>
        </div>

        {/* CTA Buttons — visible in preview but inert (no booking/email) */}
        <div className={`flex items-center justify-center gap-3 w-full${preview ? ' pointer-events-none select-none' : ''}`}>
          {/* Round message/mail button - Orange Accent as in layout */}
          <a
            href={preview ? undefined : `mailto:${profile.email}`}
            title="Get in touch"
            aria-disabled={preview || undefined}
            className="flex items-center justify-center size-11 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all hover:scale-105 active:scale-95 shrink-0 shadow-sm"
          >
            <FontAwesomeIcon icon={faEnvelope} className="size-4.5" />
          </a>

          {/* Main Book Call Button */}
          <button
            type="button"
            disabled={preview}
            onClick={onBook ?? (() => { document.querySelector('#offerings')?.scrollIntoView({ behavior: 'smooth' }) })}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold tracking-tight transition-all hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer"
          >
            <FontAwesomeIcon icon={faCalendar} className="size-3.5" />
            <span>Book call</span>
          </button>
        </div>
      </div>

    </div>
  )
}
