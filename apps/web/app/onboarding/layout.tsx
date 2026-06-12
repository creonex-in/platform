import Image from 'next/image'
import Link from 'next/link'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.ReactElement> {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-16 shrink-0 items-center border-b border-border/60 bg-background/80 px-5 backdrop-blur-sm sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-70"
        >
          <Image
            src="/logo.webp"
            alt="Creonex"
            width={30}
            height={30}
            className="size-[30px] object-contain"
          />
          <span className="font-display text-lg font-bold tracking-tight">Creonex</span>
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center sm:py-14">
        <div className="w-full max-w-[44rem]">{children}</div>
      </main>
    </div>
  )
}
