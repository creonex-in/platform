import Image from 'next/image'
import { isBannerUrl } from './types'

interface ProfileHeroProps {
  coverBannerUrl: string | null
}

export function ProfileHero({ coverBannerUrl }: ProfileHeroProps): React.ReactElement {
  const isUrl = coverBannerUrl ? isBannerUrl(coverBannerUrl) : false

  return (
    <div className="w-full h-[140px] sm:h-[180px] relative overflow-hidden bg-muted border-b border-border">
      {isUrl ? (
        <Image src={coverBannerUrl!} alt="banner" fill className="object-cover" />
      ) : coverBannerUrl ? (
        <div className="absolute inset-0" style={{ background: coverBannerUrl }} />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-purple-500/10 opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
        </>
      )}
    </div>
  )
}
