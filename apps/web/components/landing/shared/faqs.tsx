import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// ── Data ──────────────────────────────────────────────────────────────────────

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: "What happens after the payment?",
    answer:
      "You will immediately receive an email confirmation with a secure link to access your course materials or calendar invite for the 1-on-1 session.",
  },
  {
    question: "Are the video courses pre-recorded?",
    answer:
      "Yes, video courses are entirely pre-recorded and highly structured. You get lifetime access to the content and can learn at your own pace.",
  },
  {
    question: "Can I reschedule a 1-on-1 mentorship session?",
    answer:
      "Absolutely. You can reschedule any session up to 24 hours before the start time directly from your dashboard without any extra fees.",
  },
  {
    question: "Are there any refunds?",
    answer:
      "We offer a 7-day money-back guarantee for all video courses. For live sessions, full refunds are automatically provided if the mentor is unable to join.",
  },
];

export default function Faqs({ items = FAQS }: { items?: Faq[] } = {}): React.ReactElement {
  return (
    <section className="bg-background section-py-sm">
      <div className="page-container">
        <div className="mx-auto max-w-6xl">

          {/* Main Card */}
          <div className="rounded-[2.5rem] bg-card p-8 shadow-sm border border-border/50 sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">

              {/* Left Column: Title */}
              <div className="lg:col-span-4">
                <h2 className="text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                  FAQs
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
                  Guiding you through our platform and how it works.
                </p>
              </div>

              {/* Right Column: Accordions */}
              <div className="lg:col-span-8">
                <Accordion multiple={false} className="flex w-full flex-col gap-4">
                  {items.map((faq) => (
                    <AccordionItem
                      key={faq.question}
                      value={faq.question}
                      className="rounded-[14px] border border-border/60 bg-background px-5 sm:px-6 shadow-sm transition-all hover:border-primary/30 hover:bg-accent/30"
                    >
                      <AccordionTrigger className="py-5 text-left text-[15px] font-medium text-foreground/90 no-underline hover:no-underline [&[data-state=open]]:text-foreground">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {/* Bottom Support Link */}
                <div className="mt-10 text-center">
                  <p className="text-[13px] text-muted-foreground">
                    Still got questions? <a href="mailto:support@creonex.in" className="font-medium text-foreground underline decoration-border underline-offset-4 hover:text-primary transition-colors">support@creonex.in</a>
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}