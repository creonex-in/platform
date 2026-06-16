import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAward,
  faCircleCheck,
  faCircleDot,
} from '@fortawesome/free-solid-svg-icons'
import {
  faInstagram,
  faLinkedinIn,
  faYoutube,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons'
import { isBannerUrl } from './types'
import { ShareDialog } from './share-dialog'
import type { SocialLinks } from '@creonex/types'
import type { AvailableDate } from '@/dal/slots.dal'

interface ProfileHeroProps {
  coverBannerUrl: string | null
  username: string
  displayName: string
  isVerified?: boolean
  qualityTier?: string
  socialLinks?: SocialLinks
  nextSlot?: AvailableDate | null
  preview?: boolean
}

const TIER_LABELS: Record<string, string> = {
  platinum: 'Elite Creator',
  gold: 'Pro Creator',
  silver: 'Rising Star',
  featured: 'Featured',
}

const SOCIAL_ICONS = [
  { key: 'instagram', icon: faInstagram },
  { key: 'youtube', icon: faYoutube },
  { key: 'linkedin', icon: faLinkedinIn },
  { key: 'twitter', icon: faXTwitter },
] as const

export function ProfileHero({
  coverBannerUrl,
  username,
  displayName,
  isVerified,
  qualityTier,
  socialLinks,
  nextSlot,
  preview = false,
}: ProfileHeroProps): React.ReactElement {
  const isUrl = coverBannerUrl ? isBannerUrl(coverBannerUrl) : false
  const tierLabel = qualityTier ? TIER_LABELS[qualityTier] : null
  const showTierBadge = !!tierLabel || !!isVerified

  const activeSocials = SOCIAL_ICONS.filter(
    ({ key }) => socialLinks?.[key] && (socialLinks[key] as string).length > 0
  )

  return (
    <div className="w-full h-48 sm:h-56 md:h-72 relative overflow-hidden bg-muted">
      {/* Background */}
      {isUrl ? (
        <Image src={coverBannerUrl!} alt="banner" fill className="object-cover animate-fade-in" priority />
      ) : coverBannerUrl ? (
        <div className="absolute inset-0" style={{ background: coverBannerUrl }} />
      ) : (
        <>
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-background to-primary/5 opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
        </>
      )}

      {/* Subtle bottom fade so cards overlap cleanly */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-linear-to-t from-background/30 to-transparent pointer-events-none" />

      {!preview && (
        <>
          {/* Bottom-left — tier badge + availability chip */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20">
            {showTierBadge && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md shadow-sm">
                {tierLabel && <FontAwesomeIcon icon={faAward} className="size-3 text-yellow-300" />}
                {tierLabel ? (
                  <span>{tierLabel}</span>
                ) : null}
                {isVerified && (
                  <>
                    {tierLabel && <span className="opacity-40">·</span>}
                    <FontAwesomeIcon icon={faCircleCheck} className="size-3 text-blue-300" />
                    <span>Verified</span>
                  </>
                )}
              </div>
            )}

            {nextSlot && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md shadow-sm">
                <FontAwesomeIcon icon={faCircleDot} className="size-2.5 text-green-400" />
                <span>Next: {nextSlot.dayName}, {nextSlot.date}</span>
              </div>
            )}
          </div>

          {/* Bottom-right — social icons cluster + share */}
          <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-1.5 z-20">
            {activeSocials.map(({ key, icon }) => (
              <a
                key={key}
                href={socialLinks![key] as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
                className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50"
              >
                <FontAwesomeIcon icon={icon} className="size-3.5" />
              </a>
            ))}
            <ShareDialog username={username} displayName={displayName} variant="banner" />
          </div>

          {/* Mobile — share only, top-right */}
          <div className="absolute top-4 right-4 sm:hidden z-20">
            <ShareDialog username={username} displayName={displayName} variant="banner" />
          </div>
        </>
      )}
    </div>
  )
}
