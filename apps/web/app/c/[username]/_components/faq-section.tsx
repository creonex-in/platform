import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FAQS } from './types'

export function FaqSection(): React.ReactElement {
  return (
    <div className="w-full bg-background py-14 border-t border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 md:gap-14">
          <div className="md:w-[30%] shrink-0">
            <span className="bg-muted text-muted-foreground text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3.5 inline-block border border-border/60">
              Support
            </span>
            <h2 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight mb-2.5 font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-[13px] text-muted-foreground font-medium leading-relaxed max-w-[240px]">
              Everything you need to know before booking
            </p>
          </div>
          <div className="flex-1 flex flex-col">
            <Accordion multiple={false} className="space-y-1">
              {FAQS.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-b border-border py-1 last:border-b-0"
                >
                  <AccordionTrigger className="text-[13.5px] font-semibold text-foreground hover:text-primary py-3.5 text-left hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-4.5 font-medium">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-8 text-center md:text-right">
              <p className="text-[11px] text-muted-foreground font-semibold">
                Still got questions?{' '}
                <a href="mailto:hi@creonex.in" className="text-primary underline hover:text-primary/80 transition-colors">
                  hi@creonex.in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
