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
      "Creonex is an educational platform where you can learn directly from top Indian creators, industry experts, and professionals through recorded courses and live 1-on-1 mentorship.",
  },
  {
    question: "How do 1-on-1 sessions work?",
    answer:
      "You can book direct video calls with creators to get personalized career advice, portfolio reviews, or specific technical help. You choose the time, submit your questions in advance, and connect via our built-in video platform.",
  },
  {
    question: "How are creators verified?",
    answer:
      "Every creator on Creonex is vetted based on their real-world experience, portfolio, and industry expertise to ensure you are learning from active practitioners, not just influencers.",
  },
  {
    question: "Do I get lifetime access to courses?",
    answer:
      "Yes. Once you enroll in a self-paced course on Creonex, you get permanent, lifetime access to all its chapters, resources, and any future updates the creator publishes.",
  },
  {
    question: "What if I'm not satisfied with a session?",
    answer:
      "All bookings are protected by our satisfaction guarantee. If a session doesn't happen or severely misses expectations, you are eligible for a 100% refund within our 7-day window—no questions asked.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We support all major Indian payment methods including UPI, NetBanking, RuPay, Wallets, and all major credit/debit cards via our highly secure, encrypted Razorpay checkout.",
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