"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCalendarCheck,
  faVideo,
  faGraduationCap,
  faBookOpen,
  faUsers,
  faUserTie,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "motion/react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Feature = {
  id: string;
  label: string;
  icon: IconDefinition;
  title: string;
  description: string;
  benefits: string[];
  tags: string[];
  imageSrc: string;
  imageAlt: string;
  reversed: boolean;
};

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  {
    id: "sessions",
    label: "1:1 Expert Sessions",
    icon: faCalendarCheck,
    title: "Get personalized guidance from experts",
    description:
      "Book private one-on-one sessions with creators, mentors, and industry experts for focused guidance tailored exactly to where you are in your journey.",
    benefits: [
      "Private sessions with verified creators",
      "Personalized, focused attention",
      "Doubt-solving and career advice",
      "Book in minutes, meet via video",
    ],
    tags: ["30 or 60 min", "Book instantly", "Video call"],
    imageSrc: "/showcase/expert-session.png",
    imageAlt: "Creonex expert booking interface with calendar and creator profile",
    reversed: false,
  },
  {
    id: "workshops",
    label: "Live Workshops & Webinars",
    icon: faVideo,
    title: "Learn live from practitioners",
    description:
      "Join interactive live events where you can ask questions in real time and learn directly from experts who are actively working in the field.",
    benefits: [
      "Real-time Q&A with the creator",
      "Interactive, not just a recording",
      "Learn from active practitioners",
      "Recordings included post-event",
    ],
    tags: ["Live sessions", "Real-time Q&A", "Recordings"],
    imageSrc: "/showcase/expert-session.png",
    imageAlt: "Creonex live workshop interface with attendees and Q&A panel",
    reversed: true,
  },
  {
    id: "courses",
    label: "Structured Online Courses",
    icon: faGraduationCap,
    title: "Master skills at your own pace",
    description:
      "Work through step-by-step courses designed by verified creators — structured from beginner to advanced, available on your schedule, forever.",
    benefits: [
      "Step-by-step structured curriculum",
      "Lifetime access after purchase",
      "Verified creator content",
      "Learn anytime, on any device",
    ],
    tags: ["Self-paced", "Lifetime access", "Certificates"],
    imageSrc: "/showcase/course-preview.png",
    imageAlt: "Creonex course dashboard showing video player and lesson list",
    reversed: false,
  },
  {
    id: "resources",
    label: "Digital Resources & Toolkits",
    icon: faBookOpen,
    title: "Practical tools that accelerate learning",
    description:
      "Access templates, guides, e-books, frameworks, and ready-to-use resources built by creators to help you skip the basics and get to results faster.",
    benefits: [
      "Templates & frameworks ready to use",
      "E-books and in-depth guides",
      "Creator-built practical toolkits",
      "Download and keep forever",
    ],
    tags: ["Templates", "E-books", "Frameworks"],
    imageSrc: "/showcase/resources-library.png",
    imageAlt: "Creonex resource library with downloadable files and categories",
    reversed: true,
  },
  {
    id: "communities",
    label: "Exclusive Learning Communities",
    icon: faUsers,
    title: "Grow together with like-minded learners",
    description:
      "Connect with peers inside niche communities, participate in discussions, share progress, and learn collectively with others on the same path.",
    benefits: [
      "Niche communities around your goal",
      "Active discussions and peer support",
      "Moderated by expert creators",
      "Stay accountable and motivated",
    ],
    tags: ["Niche groups", "Discussions", "Peer support"],
    imageSrc: "/showcase/resources-library.png",
    imageAlt: "Creonex community feed with discussions and member profiles",
    reversed: false,
  },
  {
    id: "mentorship",
    label: "Mentorship & Coaching Programs",
    icon: faUserTie,
    title: "Long-term support from experienced mentors",
    description:
      "Get ongoing guidance, a personalized learning roadmap, and accountability from experienced mentors who help you reach your goals consistently.",
    benefits: [
      "Personalized roadmaps for your goals",
      "Regular check-ins and accountability",
      "Long-term mentor relationship",
      "Structured coaching programs",
    ],
    tags: ["Long-term", "1-on-1 coaching", "Roadmaps"],
    imageSrc: "/showcase/course-preview.png",
    imageAlt: "Creonex mentorship program dashboard with progress tracking",
    reversed: true,
  },
];

// ── ShowcaseImage ─────────────────────────────────────────────────────────────

interface ShowcaseImageProps {
  src: string;
  alt: string;
}

function ShowcaseImage({ src, alt }: ShowcaseImageProps): React.ReactElement {
  const [errored, setErrored] = useState(false);

  return (
    <div className="ls-image relative aspect-square w-full overflow-hidden rounded-2xl border border-border/50 shadow-[0_16px_48px_-12px_oklch(0_0_0/0.10)] transition-shadow duration-300 hover:shadow-[0_24px_64px_-12px_oklch(0_0_0/0.16)]">
      {!errored ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-top"
          sizes="(max-width: 1024px) 100vw, 100vw"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-muted via-muted/60 to-background/80">
          <div className="w-3/5 overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
            <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/70 px-3 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400/40" />
              <div className="mx-3 h-1.5 flex-1 rounded-full bg-border/70" />
            </div>
            <div className="space-y-3 p-5">
              <div className="h-2.5 w-full rounded-full bg-border/60" />
              <div className="h-2.5 w-4/5 rounded-full bg-border/45" />
              <div className="h-2.5 w-3/5 rounded-full bg-border/30" />
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="h-9 rounded-lg bg-primary/10" />
                <div className="h-9 rounded-lg bg-border/30" />
                <div className="h-9 rounded-lg bg-border/20" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function LearningShowcase(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeValue, setActiveValue] = useState<string[]>(["sessions"]);
  const [lastActiveId, setLastActiveId] = useState<string>("sessions");

  const activeId = activeValue[0] || lastActiveId;

  return (
    <section ref={sectionRef} className="section-py bg-background">
      <div className="page-container">

        <div className="ls-header mx-auto mb-16 max-w-2xl text-center md:mb-24">
          <p className="text-label text-primary mb-4">Multiple Ways to Learn</p>
          <h2 className="text-h1 text-balance text-foreground">
            Learn Your Way on Creonex
          </h2>
          <p className="text-body mx-auto mt-5 max-w-lg text-balance text-muted-foreground">
            Whether you want to gain a new skill, accelerate your career, or learn
            directly from creators — Creonex gives you multiple ways to learn in
            one place.
          </p>
        </div>

        {/* 2-Column Responsive Layout - Vertically Centered, No Sticky scrolling */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center">

          {/* Left Column: Image showcase on desktop, vertically centered, layout animated */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="hidden lg:block lg:col-span-5"
          >
            <div className="relative aspect-square w-full">
              {FEATURES.map((feature) => {
                const isActive = feature.id === activeId;
                return (
                  <div
                    key={feature.id}
                    className={cn(
                      "absolute inset-0 transition-all duration-500 ease-out",
                      isActive
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto z-10"
                        : "opacity-0 scale-95 translate-y-2 pointer-events-none z-0"
                    )}
                  >
                    <ShowcaseImage src={feature.imageSrc} alt={feature.imageAlt} />
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Accordion (Col span 7 to allocate more space for the text) */}
          <div className="lg:col-span-7 w-full">
            <Accordion
              value={activeValue}
              onValueChange={(val) => {
                setActiveValue(val);
                if (val.length > 0) {
                  setLastActiveId(val[0]);
                }
              }}
              className="space-y-4"
            >
              {FEATURES.map((feature) => {
                const isActive = feature.id === activeId;
                return (
                  <AccordionItem
                    key={feature.id}
                    value={feature.id}
                    className={cn(
                      "rounded-2xl border border-border/60 bg-card/40 px-5 transition-all duration-300",
                      isActive
                        ? "border-border bg-muted/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                        : "hover:border-border hover:bg-muted/10"
                    )}
                  >
                    <AccordionTrigger className="w-full py-5 text-left text-foreground hover:no-underline transition-all duration-300">
                      <div className="flex items-start gap-4 pr-4">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/55 transition-all duration-300",
                            isActive && "bg-muted/15 border-foreground/10 text-foreground"
                          )}
                        >
                          <FontAwesomeIcon icon={feature.icon} className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                            {feature.label}
                          </span>
                          <span className="text-base md:text-lg font-bold tracking-tight text-foreground">
                            {feature.title}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-1 pb-6 pl-14 text-muted-foreground">
                      <div className="flex flex-col gap-5">
                        {/* Mobile-only Image */}
                        <div className="lg:hidden w-full">
                          <ShowcaseImage src={feature.imageSrc} alt={feature.imageAlt} />
                        </div>

                        <p className="text-body-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>

                        <ul className="space-y-2.5">
                          {feature.benefits.map((benefit) => (
                            <li key={benefit} className="flex items-center gap-3">
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                className="h-4 w-4 shrink-0 text-muted-foreground"
                              />
                              <span className="text-body-sm text-foreground/85">
                                {benefit}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {feature.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-border/80 bg-muted/40 px-3 py-0.5 text-[11px] font-medium text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

        </div>

        <div className="mt-16 flex justify-center">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/learner/courses" />}
            className="rounded-full px-8"
          >
            Explore all learning paths
            <FontAwesomeIcon icon={faArrowRight} className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>

      </div>
    </section>
  );
}
