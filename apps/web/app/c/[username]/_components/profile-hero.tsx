import Image from 'next/image'
import { isBannerUrl } from './types'
import { ShareDialog } from './share-dialog'

interface ProfileHeroProps {
  coverBannerUrl: string | null
  username: string
  displayName: string
}

export function ProfileHero({ coverBannerUrl, username, displayName }: ProfileHeroProps): React.ReactElement {
  const isUrl = coverBannerUrl ? isBannerUrl(coverBannerUrl) : false

  return (
    <div className="w-full h-[180px] sm:h-[240px] md:h-[280px] relative overflow-hidden bg-muted border-b border-border">
      {isUrl ? (
        <Image src={coverBannerUrl!} alt="banner" fill className="object-cover animate-fade-in" priority />
      ) : coverBannerUrl ? (
        <div className="absolute inset-0" style={{ background: coverBannerUrl }} />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 via-orange-500/5 to-purple-500/10 opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
        </>
      )}

      {/* Floating Share button in bottom-right */}
      <div className="absolute bottom-4 right-4 z-10">
        <ShareDialog username={username} displayName={displayName} variant="banner" />
      </div>
    </div>
  )
}
