import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background selection:bg-primary/30">
      {/* Background gradients and meshes */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(147,51,234,0.15),_transparent_40%)]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Decorative Blobs */}
      <div className="absolute -top-32 left-1/2 z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[440px] px-4 sm:px-6">
        <div className="mb-8 flex justify-center">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-all hover:scale-105"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-foreground/5 p-2 ring-1 ring-foreground/10 backdrop-blur-md transition-all group-hover:ring-foreground/20 group-hover:bg-foreground/10">
              <Image
                src="/logo.webp"
                alt="Creonex"
                width={32}
                height={32}
                className="size-full object-contain"
                priority
              />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              Creonex
            </span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-background/60 p-8 shadow-2xl backdrop-blur-2xl sm:p-10">
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent pointer-events-none opacity-50" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
