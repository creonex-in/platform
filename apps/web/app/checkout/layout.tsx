import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faShieldHalved } from '@fortawesome/free-solid-svg-icons'

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground font-sans">
      {/* Secure header */}
      <header className="border-b border-border/60 bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.webp" alt="" width={28} height={28} className="size-7 object-contain" priority />
            <span className="text-base font-bold tracking-tight">Creonex</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <span className="size-7 rounded-full bg-primary/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faLock} className="size-3 text-primary" />
            </span>
            Secure Checkout
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 md:py-12">
        {children}
      </main>

      {/* Trust footer */}
      <footer className="border-t border-border/60 py-5">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faShieldHalved} className="size-3 text-primary/70" />
            Payments secured by Razorpay · 256-bit SSL encryption
          </p>
          <p>© Creonex</p>
        </div>
      </footer>
    </div>
  )
}
