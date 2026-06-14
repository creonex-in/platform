'use client'

import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMapPin,
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
import { getInitials } from './types'
import type { PublicCreatorProfile } from '@creonex/types'

interface ProfileSidebarProps {
  profile: PublicCreatorProfile
  displayName: string
}

export function ProfileSidebar({ profile, displayName }: ProfileSidebarProps) {
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
      <div className="relative rounded-[24px] border border-border/80 bg-card p-6 sm:p-8 md:p-9 shadow-[0_12px_48px_rgba(0,0,0,0.05)] text-center -mt-16 sm:-mt-24 md:-mt-28 relative z-10 overflow-hidden">
        {/* Subtle top background highlight */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-600/5 to-transparent pointer-events-none" />

        {/* Rank/Tier Badge */}
        {profile.qualityTier && profile.qualityTier !== 'new' && (
          <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 dark:bg-zinc-800 text-white text-[10px] font-bold mb-5 border border-slate-800 dark:border-zinc-700 select-none shadow-sm uppercase tracking-wider">
            <FontAwesomeIcon icon={faAward} className="size-3.5 text-amber-400" />
            <span>
              {profile.qualityTier === 'platinum' ? 'Top 1% Mentor' : 
               profile.qualityTier === 'gold' ? 'Top Rated Creator' :
               profile.qualityTier === 'silver' ? 'Rising Star' : 'Verified Pro'}
            </span>
          </div>
        )}

        {/* Avatar */}
        <div className="mx-auto w-[120px] h-[120px] sm:w-[136px] sm:h-[136px] rounded-full border-[6px] border-card shadow-[0_10px_30px_rgba(0,0,0,0.1)] bg-muted overflow-hidden relative mb-6 transition-transform hover:scale-[1.02] duration-300">
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
          <h2 className="text-[21px] sm:text-[23px] font-extrabold text-foreground tracking-tight font-display leading-tight">
            {displayName}
          </h2>
          {profile.isVerified && (
            <span className="inline-flex items-center justify-center bg-cyan-500 text-white rounded-full w-4.5 h-4.5 shrink-0 shadow-sm" title="Verified Creator">
              <FontAwesomeIcon icon={faCheck} className="size-2.5" />
            </span>
          )}
        </div>

        {/* Niche / Role Title */}
        <p className="text-[13px] sm:text-[13.5px] text-muted-foreground font-semibold leading-normal mb-3 px-1">
          {nicheLabel} {profile.experienceYears ? `· ${profile.experienceYears}+ yrs` : ''}
        </p>

        {/* Location (Clean & Mocked/Remote fallback) */}
        <div className="flex items-center justify-center gap-1.5 text-muted-foreground/80 text-[12px] font-semibold mb-6">
          <FontAwesomeIcon icon={faMapPin} className="size-3 text-muted-foreground/50 shrink-0" />
          <span>Toronto, Ontario, Canada</span>
        </div>

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
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-border/80 text-muted-foreground hover:text-cyan-600 hover:border-cyan-600/50 hover:bg-cyan-500/5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
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
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Sessions</p>
            <p className="text-[15px] font-extrabold text-foreground leading-none">{profile.totalSessions}</p>
          </div>
          <div className="border-r border-border/60 last:border-r-0">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Reviews</p>
            <p className="text-[15px] font-extrabold text-foreground leading-none">{profile.totalReviews}</p>
          </div>
          <div className="last:border-r-0">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Rating</p>
            <p className="text-[15px] font-extrabold text-foreground leading-none">
              {parseFloat(profile.smoothedRating) > 0 ? parseFloat(profile.smoothedRating).toFixed(1) : '—'}
            </p>
          </div>
        </div>

        {/* Spoken Languages & Response Speeds */}
        <div className="flex flex-col gap-2.5 mb-8 text-left text-[12px] text-muted-foreground/95 font-medium border-b border-border/60 pb-6">
          {profile.languages && profile.languages.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground/50 font-semibold">Languages</span>
              <span className="font-semibold text-foreground truncate max-w-[150px]">{profile.languages.join(', ')}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground/50 font-semibold">Replies</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <FontAwesomeIcon icon={faBolt} className="size-3 text-amber-500 animate-pulse" />
              <span>In a few hours</span>
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-3 w-full">
          {/* Round message/mail button - Orange Accent as in layout */}
          <a
            href="mailto:hi@creonex.in"
            title="Get in touch"
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all hover:scale-105 active:scale-95 shrink-0 shadow-md shadow-orange-500/20"
          >
            <FontAwesomeIcon icon={faEnvelope} className="size-4.5" />
          </a>

          {/* Main Book Call Button - Teal/Blue accent style */}
          <a
            href="#offerings"
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-[13.5px] font-bold tracking-tight transition-all hover:scale-[1.02] active:scale-98 shadow-md shadow-cyan-600/10 cursor-pointer"
          >
            <FontAwesomeIcon icon={faCalendar} className="size-3.5" />
            <span>Book call</span>
          </a>
        </div>
      </div>

      {/* Expert In Card */}
      {profile.tags && profile.tags.length > 0 && (
        <div className="rounded-[24px] border border-border/80 bg-card p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Expert in
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3.5 py-1.5 rounded-lg border border-border bg-muted/30 text-[12.5px] font-medium text-foreground hover:bg-muted/60 transition-colors duration-150"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
