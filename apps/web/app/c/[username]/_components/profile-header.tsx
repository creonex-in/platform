import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'
import { BadgesButton } from './badges-button'
import { ShareDialog } from './share-dialog'
import { SOCIAL_ICONS } from './types'
import type { PublicCreatorProfile } from '@creonex/types'

interface ProfileHeaderProps {
  profile: PublicCreatorProfile
  displayName: string
  initials: string
  socialEntries: [string, string][]
}

export function ProfileHeader({
  profile,
  displayName,
  initials,
  socialEntries,
}: ProfileHeaderProps): React.ReactElement {
  return (
    <div className="w-full bg-background pt-0 pb-6 border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar: overlaps banner */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-[50px] sm:-mt-[70px] relative z-10 mb-6 gap-6 sm:gap-0">
          <div className="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] rounded-[24px] sm:rounded-[32px] border-[5px] border-background shadow-md bg-muted overflow-hidden shrink-0 relative">
            {profile.profilePhotoUrl ? (
              <Image src={profile.profilePhotoUrl} alt={displayName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl sm:text-3xl">
                {initials}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button className="bg-primary hover:bg-primary/95 active:scale-98 text-primary-foreground px-6 py-2.5 rounded-full text-[13.5px] font-bold transition-all shadow-sm cursor-pointer">
              Follow
            </button>
            <button className="bg-card hover:bg-muted active:scale-98 text-foreground border border-border px-6 py-2.5 rounded-full text-[13.5px] font-bold transition-all shadow-sm cursor-pointer">
              Get in touch
            </button>
            <ShareDialog username={profile.username} displayName={displayName} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="max-w-2xl">
            {/* Name + PRO badge */}
            <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
              <h1 className="text-[24px] sm:text-[28px] font-extrabold text-foreground tracking-tight leading-none font-display">
                {displayName}
              </h1>
              {(profile.qualityTier === 'platinum' || profile.qualityTier === 'gold') && (
                <span className="bg-slate-900 dark:bg-zinc-800 text-white text-[9px] font-bold px-2 py-[2.5px] rounded-[5px] flex items-center gap-1 shrink-0 mt-0.5 border border-slate-800 dark:border-zinc-700">
                  PRO <FontAwesomeIcon icon={faBolt} className="size-[8px] text-amber-400" />
                </span>
              )}
            </div>

            {/* Niche subtitle */}
            {profile.primaryNiche && (
              <p className="text-[13px] text-muted-foreground font-semibold mb-3 -mt-1">
                {profile.primaryNiche}
              </p>
            )}

            {/* Social links */}
            {socialEntries.length > 0 && (
              <div className="flex items-center gap-3 mt-2">
                {socialEntries.map(([key, url]) => {
                  const meta = SOCIAL_ICONS[key]
                  if (!meta) return null
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={meta.label}
                      className={cn('transition-opacity hover:opacity-70', meta.color)}
                    >
                      <FontAwesomeIcon icon={meta.icon} className="size-4" />
                    </a>
                  )
                })}
              </div>
            )}

            {/* Languages */}
            {profile.languages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.languages.map((lang) => (
                  <span
                    key={lang}
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Badges + Stats */}
          <div className="flex flex-col sm:items-end gap-5">
            <BadgesButton profile={profile} />
            {(profile.totalSessions > 0 || profile.totalReviews > 0) ? (
              <div className="flex items-center gap-6 sm:gap-10">
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold mb-0.5 uppercase tracking-wider">Sessions</p>
                  <p className="text-[18px] sm:text-[22px] font-extrabold text-foreground leading-none">{profile.totalSessions}</p>
                </div>
                <div className="border-l border-border h-8" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold mb-0.5 uppercase tracking-wider">Reviews</p>
                  <p className="text-[18px] sm:text-[22px] font-extrabold text-foreground leading-none">{profile.totalReviews}</p>
                </div>
                {parseFloat(profile.smoothedRating) > 0 && (
                  <>
                    <div className="border-l border-border h-8" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold mb-0.5 uppercase tracking-wider">Rating</p>
                      <p className="text-[18px] sm:text-[22px] font-extrabold text-foreground leading-none flex items-baseline gap-1">
                        {parseFloat(profile.smoothedRating).toFixed(1)}
                        <span className="text-[12px] text-muted-foreground font-bold">/5</span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : profile.experienceYears != null ? (
              <p className="text-[12px] text-muted-foreground font-semibold">
                {profile.experienceYears}+ yrs experience
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
