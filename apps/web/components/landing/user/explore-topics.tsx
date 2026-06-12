"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPalette,
  faChartLine,
  faCode,
  faGraduationCap,
  faRocket,
  faFileLines,
  faStar,
  faArrowRight,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

type Avatar = { initials: string; bg: string; text: string };

type Category = {
  id: string;
  // TODO: add href: "/courses?category={id}" when routing is built
  label: string;
  experts: number;
  courses: number;
  trending?: boolean;
  icon: IconDefinition;
  iconBg: string;
  iconHover: string;
  iconColor: string;
  borderHover: string;
  glowColor: string;
  avatars: Avatar[];
};

// ─── 3-color accent system ────────────────────────────────────────────────────
//   primary (teal) → Coding, Career Growth
//   amber          → Finance, Resume Review
//   violet         → Design, CAT Prep, Personal Brand

const CATEGORIES: Category[] = [
  {
    id: "design",
    label: "UI/UX Design",
    experts: 240,
    courses: 38,
    icon: faPalette,
    iconBg: "bg-violet-500/10",
    iconHover: "group-hover:bg-violet-500/20",
    iconColor: "text-violet-500",
    borderHover: "hover:border-violet-400/30",
    glowColor: "bg-violet-500/10",
    avatars: [
      { initials: "MK", bg: "bg-violet-500/15", text: "text-violet-500" },
      { initials: "PL", bg: "bg-violet-500/20", text: "text-violet-500" },
      { initials: "RS", bg: "bg-violet-500/10", text: "text-violet-500" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    experts: 310,
    courses: 52,
    trending: true,
    icon: faChartLine,
    iconBg: "bg-amber-500/10",
    iconHover: "group-hover:bg-amber-500/20",
    iconColor: "text-amber-500",
    borderHover: "hover:border-amber-400/30",
    glowColor: "bg-amber-500/10",
    avatars: [
      { initials: "RN", bg: "bg-amber-500/15", text: "text-amber-600" },
      { initials: "VC", bg: "bg-amber-500/20", text: "text-amber-600" },
      { initials: "AK", bg: "bg-amber-500/10", text: "text-amber-600" },
    ],
  },
  {
    id: "coding",
    label: "Coding",
    experts: 420,
    courses: 86,
    trending: true,
    icon: faCode,
    iconBg: "bg-primary/10",
    iconHover: "group-hover:bg-primary/20",
    iconColor: "text-primary",
    borderHover: "hover:border-primary/30",
    glowColor: "bg-primary/10",
    avatars: [
      { initials: "SR", bg: "bg-primary/15", text: "text-primary" },
      { initials: "JD", bg: "bg-primary/20", text: "text-primary" },
      { initials: "TK", bg: "bg-primary/10", text: "text-primary" },
    ],
  },
  {
    id: "cat",
    label: "CAT Prep",
    experts: 180,
    courses: 24,
    icon: faGraduationCap,
    iconBg: "bg-violet-500/10",
    iconHover: "group-hover:bg-violet-500/20",
    iconColor: "text-violet-500",
    borderHover: "hover:border-violet-400/30",
    glowColor: "bg-violet-500/10",
    avatars: [
      { initials: "AP", bg: "bg-violet-500/15", text: "text-violet-500" },
      { initials: "MR", bg: "bg-violet-500/20", text: "text-violet-500" },
      { initials: "SG", bg: "bg-violet-500/10", text: "text-violet-500" },
    ],
  },
  {
    id: "career",
    label: "Career Growth",
    experts: 290,
    courses: 44,
    trending: true,
    icon: faRocket,
    iconBg: "bg-primary/10",
    iconHover: "group-hover:bg-primary/20",
    iconColor: "text-primary",
    borderHover: "hover:border-primary/30",
    glowColor: "bg-primary/10",
    avatars: [
      { initials: "TR", bg: "bg-primary/15", text: "text-primary" },
      { initials: "AS", bg: "bg-primary/20", text: "text-primary" },
      { initials: "NK", bg: "bg-primary/10", text: "text-primary" },
    ],
  },
  {
    id: "resume",
    label: "Resume Review",
    experts: 150,
    courses: 18,
    icon: faFileLines,
    iconBg: "bg-amber-500/10",
    iconHover: "group-hover:bg-amber-500/20",
    iconColor: "text-amber-500",
    borderHover: "hover:border-amber-400/30",
    glowColor: "bg-amber-500/10",
    avatars: [
      { initials: "DM", bg: "bg-amber-500/15", text: "text-amber-600" },
      { initials: "LS", bg: "bg-amber-500/20", text: "text-amber-600" },
      { initials: "PK", bg: "bg-amber-500/10", text: "text-amber-600" },
    ],
  },
  {
    id: "brand",
    label: "Personal Brand",
    experts: 210,
    courses: 31,
    icon: faStar,
    iconBg: "bg-violet-500/10",
    iconHover: "group-hover:bg-violet-500/20",
    iconColor: "text-violet-500",
    borderHover: "hover:border-violet-400/30",
    glowColor: "bg-violet-500/10",
    avatars: [
      { initials: "VR", bg: "bg-violet-500/15", text: "text-violet-500" },
      { initials: "JK", bg: "bg-violet-500/20", text: "text-violet-500" },
      { initials: "SP", bg: "bg-violet-500/10", text: "text-violet-500" },
    ],
  },
];

// ─── Card ─────────────────────────────────────────────────────────────────────

function CategoryCard({ cat }: { cat: Category }): React.ReactElement {
  return (
    <button
      type="button"
      className={cn(
        "category-card group relative flex cursor-pointer flex-col justify-between overflow-hidden",
        "w-[172px] shrink-0 snap-start md:w-auto md:shrink",
        "min-h-[210px] rounded-2xl border border-border bg-card p-5 text-left",
        "shadow-[0_2px_20px_rgba(0,0,0,0.03)]",
        "transition-all duration-500 ease-out will-change-transform",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-foreground/[0.07]",
        cat.borderHover,
      )}
    >
      {/* Corner glow */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl",
          "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          cat.glowColor,
        )}
      />

      {/* Top: icon + optional trending badge */}
      <div className="relative z-10 flex items-start justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500",
            cat.iconBg,
            cat.iconHover,
          )}
        >
          <FontAwesomeIcon
            icon={cat.icon}
            className={cn(
              "h-5 w-5 transition-transform duration-500 group-hover:scale-110",
              cat.iconColor,
            )}
          />
        </div>

        {cat.trending && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-primary">
            Trending
          </span>
        )}
      </div>

      {/* Bottom: label + counts + avatars */}
      <div className="relative z-10 flex flex-col gap-2.5">
        {/* Avatar cluster */}
        <div className="flex items-center">
          {cat.avatars.map((av, i) => (
            <span
              key={av.initials}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ring-2 ring-card",
                av.bg,
                av.text,
                i > 0 && "-ml-1.5",
              )}
            >
              {av.initials}
            </span>
          ))}
        </div>

        {/* Label + counts */}
        <div>
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {cat.label}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {cat.experts} experts · {cat.courses} courses
          </p>
        </div>
      </div>
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function ExploreTopics(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".category-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.08,
          ease: "power4.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="section-py bg-muted/30">
      <div className="page-container">

        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            Explore Topics
          </span>
          <h2 className="text-h1 mb-4 text-balance text-foreground">
            1,800+ verified experts. One platform.
          </h2>
          <p className="text-body mx-auto max-w-md text-balance text-muted-foreground">
            Browse by category and find your mentor in under 60 seconds.
          </p>
        </div>

        {/* Cards — carousel on mobile, 7-col grid on desktop */}
        <div className="relative">
          <div
            className={cn(
              "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0",
              "lg:grid-cols-7",
            )}
          >
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>

          {/* Right fade — scroll affordance on mobile */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-muted/30 to-transparent md:hidden"
          />
        </div>

        {/* Mobile scroll hint */}
        <p className="mt-3 text-center text-xs text-muted-foreground/50 md:hidden">
          Swipe to explore all topics
          <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-2.5 w-2.5" />
        </p>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Button variant="outline" size="md">
            See more topics
            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
          </Button>
        </div>

      </div>
    </section>
  );
}
