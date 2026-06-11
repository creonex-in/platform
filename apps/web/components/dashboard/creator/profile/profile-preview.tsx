'use client'

import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import {
  faInstagram,
  faXTwitter,
  faLinkedinIn,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'
import type { ProfileData, PreviewDevice } from './types'

interface ProfilePreviewProps {
  profile: ProfileData
  device: PreviewDevice
  onEdit: () => void
}

export function ProfilePreview({ profile, device, onEdit }: ProfilePreviewProps): React.ReactElement {
  const isMobile = device === 'mobile'

  const socialLinks: { key: keyof ProfileData['socials']; icon: IconDefinition }[] = [
    { key: 'instagram', icon: faInstagram },
    { key: 'twitter', icon: faXTwitter },
    { key: 'linkedin', icon: faLinkedinIn },
    { key: 'youtube', icon: faYoutube },
    { key: 'website', icon: faGlobe },
  ]
  const activeSocials = socialLinks.filter((s) => profile.socials[s.key].trim().length > 0)

  return (
    <div
      className={cn(
        'mx-auto w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all',
        isMobile ? 'max-w-[400px]' : 'max-w-5xl'
      )}
    >
      <div className={cn('grid min-h-[560px]', isMobile ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]')}>
        {/* identity panel */}
        <div className="relative flex flex-col justify-between bg-primary p-7 text-primary-foreground sm:p-9">
          {/* edit button */}
          <button
            type="button"
            onClick={onEdit}
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-medium backdrop-blur transition-colors hover:bg-primary-foreground/25"
          >
            <FontAwesomeIcon icon={faPen} className="size-3" />
            Edit
          </button>

          <div>
            <div className="size-24 overflow-hidden rounded-full bg-gradient-to-br from-amber-300 via-rose-200 to-primary-foreground shadow-lg ring-4 ring-primary-foreground/20" />
            <h1 className="mt-6 font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl">
              {profile.displayName || 'Your Name'}
            </h1>
            {profile.headline && (
              <p className="mt-2 text-sm font-medium text-primary-foreground/80">{profile.headline}</p>
            )}
            {profile.intro && (
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-primary-foreground/75">{profile.intro}</p>
            )}

            {activeSocials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {activeSocials.map((s) => (
                  <span
                    key={s.key}
                    className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground"
                  >
                    <FontAwesomeIcon icon={s.icon} className="size-4" />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm font-semibold">
            <Image src="/logo.webp" alt="Creonex" width={22} height={22} className="size-5 object-contain brightness-0 invert" />
            creonex
          </div>
        </div>

        {/* content panel */}
        <div className="flex flex-col gap-6 bg-background p-7 sm:p-9">
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold tracking-tight">About</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {profile.bio || 'Tell learners about your experience and how you help. Click Edit to add your bio.'}
            </p>
          </section>

          {profile.tags.length > 0 && (
            <section className="space-y-2">
              <h2 className="font-display text-lg font-semibold tracking-tight">Expertise</h2>
              <div className="flex flex-wrap gap-1.5">
                {profile.tags.map((t) => (
                  <span key={t} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          <div className="mt-auto flex items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="hover:text-foreground">Terms</span>
            <span>·</span>
            <span className="hover:text-foreground">Privacy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
