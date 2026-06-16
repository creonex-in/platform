import Link from 'next/link'
import Image from 'next/image'

export function CreatorProfileFooter(): React.ReactElement {
  return (
    <footer className="flex items-center justify-center gap-1.5 py-6 text-xs text-muted-foreground/50">
      <span>Powered by</span>
      <Link href="/" className="flex items-center gap-1 opacity-50 transition-opacity hover:opacity-80">
        <Image
          src="/logo.webp"
          alt="Creonex"
          width={14}
          height={14}
          className="size-3.5 object-contain dark:invert"
        />
        <span className="font-semibold tracking-tight">Creonex</span>
      </Link>
    </footer>
  )
}
