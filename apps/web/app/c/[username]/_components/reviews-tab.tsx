import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuoteLeft, faStar, faCircleCheck } from '@fortawesome/free-solid-svg-icons'

export interface TestimonialItem {
  id: string
  name: string
  niche: string
  quote: string
  initials: string
  isVerified?: boolean
}

interface ReviewsTabProps {
  testimonials: TestimonialItem[]
}

export function ReviewsTab({ testimonials }: ReviewsTabProps) {
  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-muted/20 rounded-2xl border border-border">
        <p className="text-muted-foreground text-sm font-medium">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {testimonials.map((t) => (
        <div 
          key={t.id} 
          className="flex flex-col p-5 sm:p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          {/* Subtle accent highlight */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {t.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-foreground leading-none">{t.name}</h4>
                {t.isVerified && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
                    title="This reviewer booked a session with this creator"
                  >
                    <FontAwesomeIcon icon={faCircleCheck} className="size-2.5" />
                    Verified booking
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{t.niche}</p>
            </div>
            <div className="ml-auto flex gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <FontAwesomeIcon key={i} icon={faStar} className="size-3" />
              ))}
            </div>
          </div>
          
          <div className="relative flex-1">
            <FontAwesomeIcon icon={faQuoteLeft} className="absolute -top-1 -left-1 size-5 text-muted/50" />
            <p className="text-sm text-foreground/90 leading-relaxed relative z-10 pl-6">
              "{t.quote}"
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
