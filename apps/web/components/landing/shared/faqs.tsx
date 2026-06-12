"use client";

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
    question: "What is Creonex?",
    answer:
      "Creonex is an Indian creator-education platform where micro-creators can sell courses, host 1-on-1 sessions, and build paid communities — all from one place, with no tech setup required.",
  },
  {
    question: "Who is Creonex for?",
    answer:
      "Creonex is built for knowledge creators — designers, educators, coaches, artists, and professionals — who want to monetise their expertise without relying on follower count or big budgets.",
  },
  {
    question: "What can I build on Creonex?",
    answer:
      "You can create recorded courses with structured chapters, open live 1-on-1 booking sessions, and run private communities for your audience — all under your own branded profile.",
  },
  {
    question: "What makes Creonex different from other platforms?",
    answer:
      "Unlike other platforms, Creonex ranks creators by quality of teaching — not follower count. Our discovery engine surfaces the best educators first, giving every serious creator a fair shot.",
  },
  {
    question: "How does Creonex help creators grow their business?",
    answer:
      "We handle payments, scheduling, student management, and discovery so you can focus entirely on teaching. Automated reminders, UPI payouts, and a monthly earnings dashboard come built-in.",
  },
  {
    question: "Is Creonex good for beginners with no audience?",
    answer:
      "Absolutely. Most of our creators start with zero audience. The platform is designed to help you build from scratch — your first free session can become your first paying cohort within weeks.",
  },
  {
    question: "How do payouts work?",
    answer:
      "Earnings are processed via UPI and direct bank transfer. Payouts are instant after each transaction and visible in your earnings dashboard with a full breakdown.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Faqs(): React.ReactElement {
  return (
    <section className="section-py bg-background">
      <div className="page-container">

        {/* Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-h1 text-balance text-foreground">
            Frequently asked questions
          </h2>
          <p className="text-body mt-4 text-muted-foreground">
            Everything you need to know before you start.
          </p>
        </div>

        {/* Accordion */}
        <div className="mx-auto max-w-6xl">
          <Accordion>
            {FAQS.map((faq) => (
              <AccordionItem
                key={faq.question}
                value={faq.question}
                className="border-b border-muted-foreground/20 last:border-b-0"
              >
                <AccordionTrigger className="py-5 text-lg font-medium text-foreground no-underline hover:no-underline hover:text-primary transition-colors duration-200 md:text-xl">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
    </section>
  );
}