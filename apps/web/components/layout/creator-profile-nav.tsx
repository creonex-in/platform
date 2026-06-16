'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShareFromSquare } from '@fortawesome/free-solid-svg-icons'
import { buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

interface CreatorProfileNavProps {
  username: string
  displayName: string
  primaryNiche: string | null
  profilePhotoUrl: string | null
}

function formatNiche(niche: string | null): string | null {
  if (!niche) return null
  return niche.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function CreatorProfileNav({
  username,
  displayName,
  primaryNiche,
  profilePhotoUrl,
}: CreatorProfileNavProps): React.ReactElement {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const isTestimonialPage = pathname.includes('/testimonial')
  const niche = formatNiche(primaryNiche)
  const initials = getInitials(displayName)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleShare() {
    const url = `${window.location.origin}/c/${username}`
    if (navigator.share) {
      await navigator.share({ title: displayName, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <header
      className={[
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="page-container flex h-14 items-center justify-between">

        {/* Left — creator identity */}
        <div className="flex items-center gap-2.5">
          <Avatar className="size-7 shrink-0">
            {profilePhotoUrl && <AvatarImage src={profilePhotoUrl} alt={displayName} />}
            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-display text-sm font-semibold tracking-tight truncate max-w-36">
            {displayName}
          </span>
          {niche && (
            <span className="hidden sm:inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {niche}
            </span>
          )}
        </div>

        {/* Center — scroll tracker tabs */}
        <nav className="hidden sm:flex items-center gap-1 rounded-full border border-border/40 bg-background/60 px-1 py-1 backdrop-blur-sm">
          <Link
            href={`/c/${username}#offerings`}
            className={[
              'rounded-full px-4 py-1 text-xs font-medium transition-all duration-200',
              !isTestimonialPage
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Offerings
          </Link>
          <Link
            href={`/c/${username}/testimonial`}
            className={[
              'rounded-full px-4 py-1 text-xs font-medium transition-all duration-200',
              isTestimonialPage
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Wall of Love
          </Link>
        </nav>

        {/* Right — share + CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            aria-label="Share profile"
            className="flex size-8 items-center justify-center rounded-full border border-border/50 bg-background/60 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground hover:border-border"
          >
            <FontAwesomeIcon icon={faShareFromSquare} className="size-3.5" />
          </button>

          <Link href={`/c/${username}#offerings`} className={buttonVariants({ size: 'sm' })}>
            Book a Session
          </Link>
        </div>

      </div>
    </header>
  )
}
