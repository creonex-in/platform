import Image from 'next/image'
import Link from 'next/link'
import { OnboardingRail } from '@/components/onboarding/onboarding-rail'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.ReactElement> {
  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      <OnboardingRail />

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-y-auto">
        {/* Mobile brand bar (rail is hidden under lg) */}
        <header className="flex h-16 shrink-0 items-center border-b border-border/40 px-5 lg:hidden bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-70">
            <Image src="/logo.webp" alt="Creonex" width={28} height={28} className="size-7 object-contain drop-shadow-sm dark:invert" />
            <span className="font-display text-lg font-bold tracking-tight">Creonex</span>
          </Link>
        </header>

        <main className="flex flex-1 items-start justify-center px-5 py-8 sm:items-center sm:px-8 sm:py-12">
          <div className="w-full max-w-2xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
