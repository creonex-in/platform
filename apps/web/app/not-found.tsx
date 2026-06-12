import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faCompass } from '@fortawesome/free-solid-svg-icons'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background decorations matching the premium UI aesthetic */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 blur-[100px] pointer-events-none">
        <div className="h-72 w-72 rounded-full bg-primary/40" />
        <div className="h-72 w-72 rounded-full bg-blue-500/30 -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="z-10 flex w-full max-w-lg flex-col items-center px-6 text-center animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-8">
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-b from-primary/20 to-primary/5 shadow-2xl shadow-primary/10 border border-primary/20">
          <FontAwesomeIcon icon={faCompass} className="size-16 text-primary drop-shadow-md" />
        </div>
        
        <span className="mb-4 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Error 404
        </span>
        
        <h1 className="mb-3 font-display text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
          Lost in space
        </h1>
        
        <p className="mb-8 text-sm sm:text-base text-muted-foreground leading-relaxed">
          We can&apos;t seem to find the page you&apos;re looking for. It might have been moved, deleted, or doesn&apos;t exist anymore.
        </p>

        <Link 
          href="/"
          className={buttonVariants({
            size: "lg",
            className: "rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          })}
        >
          <FontAwesomeIcon icon={faHouse} className="mr-2 size-4" />
          Return Home
        </Link>
      </div>
    </div>
  )
}
