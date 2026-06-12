import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons'
import type { PublicOffering } from '@creonex/types'

interface CtaBannerProps {
  offering: PublicOffering
  displayName: string
}

export function CtaBanner({ offering, displayName }: CtaBannerProps): React.ReactElement {
  return (
    <div className="w-full bg-background py-12 border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-[20px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="mb-6 md:mb-0 max-w-xl relative z-10">
            <h3 className="text-[17px] sm:text-[19px] font-bold mb-2 text-foreground font-display">
              Book a 1:1 Session with {displayName}
            </h3>
            <p className="text-[13px] text-muted-foreground font-medium leading-relaxed">
              Get focused attention, personalised advice, and a clear action plan from an expert in their field.
            </p>
          </div>
          <a
            href="#offerings"
            className="bg-primary text-primary-foreground hover:bg-primary/95 active:scale-98 transition-all px-8 py-3.5 rounded-full text-[13.5px] font-bold flex items-center justify-center gap-2 shrink-0 self-start md:self-auto cursor-pointer shadow-sm relative z-10"
          >
            <FontAwesomeIcon icon={faCalendarCheck} className="size-3.5" />
            Book Session{` — ₹${offering.price.toLocaleString('en-IN')}`}
          </a>
        </div>
      </div>
    </div>
  )
}
