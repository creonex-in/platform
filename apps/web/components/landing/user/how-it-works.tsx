"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/ui/button";
import {
  faCompass,
  faUserTie,
  faBookOpen,
  faCreditCard,
  faComments,
  faTrophy,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ── Data ──────────────────────────────────────────────────────────────────────

type Step = {
  id: string;
  number: string;
  icon: IconDefinition;
  title: string;
  description: string;
  tag: string;
  imageSrc: string;
  imageAlt: string;
};

const STEPS: Step[] = [
  {
    id: "path", number: "01", icon: faCompass,
    title: "Pick your learning path",
    description: "Design, tech, or marketing — choose the domain you want to master.",
    tag: "Explore",
    imageSrc: "/showcase/course-preview.png", imageAlt: "Creonex learning path selection",
  },
  {
    id: "expert", number: "02", icon: faUserTie,
    title: "Find the right expert",
    description: "Real creators, real reviews. Browse and pick someone worth learning from.",
    tag: "Discover",
    imageSrc: "/showcase/expert-session.png", imageAlt: "Creonex expert profiles",
  },
  {
    id: "resources", number: "03", icon: faBookOpen,
    title: "Enroll or book a session",
    description: "Self-paced courses with lifetime access, or direct 1:1 time with your expert.",
    tag: "Learn",
    imageSrc: "/showcase/resources-library.png", imageAlt: "Creonex course and session booking",
  },
  {
    id: "payment", number: "04", icon: faCreditCard,
    title: "Pay securely",
    description: "One clean checkout. Instant access. No hidden charges, ever.",
    tag: "Secure",
    imageSrc: "/showcase/course-preview.png", imageAlt: "Creonex secure checkout",
  },
  {
    id: "collaborate", number: "05", icon: faComments,
    title: "Work with your expert",
    description: "Live sessions, direct feedback, real questions answered in real time.",
    tag: "Connect",
    imageSrc: "/showcase/expert-session.png", imageAlt: "Creonex live session with expert",
  },
  {
    id: "skilled", number: "06", icon: faTrophy,
    title: "Build real skills",
    description: "Track progress and develop expertise that employers actually notice.",
    tag: "Grow",
    imageSrc: "/showcase/resources-library.png", imageAlt: "Creonex skill progress and certificates",
  },
];

const TRANSITIONS = STEPS.length - 1; // 5

// ── Card image ────────────────────────────────────────────────────────────────

function CardImage({ src, alt }: { src: string; alt: string }): React.ReactElement {
  const [errored, setErrored] = useState(false);

  return (
    <div className="relative mx-5 overflow-hidden rounded-xl border border-border bg-muted">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <div className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
        <div className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
        <div className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
        <div className="mx-2 h-1 flex-1 rounded-full bg-foreground/10" />
      </div>
      <div className="relative aspect-video w-full">
        {!errored ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 144vw, (max-width: 1024px) 130vw, 120vw"
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-foreground/10 ring-1 ring-border" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-1.5 w-3/4 rounded-full bg-foreground/10" />
                <div className="h-1.5 w-1/2 rounded-full bg-foreground/5" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 h-12 rounded-lg border border-border bg-background" />
              <div className="h-12 rounded-lg border border-border bg-background" />
            </div>
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function HowItWorks(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  // scrollContainer provides the scroll range — h-[600vh]:
  //   100vh  = initial view (card 0 already visible)
  //   500vh  = 5 transitions (cards 1–5 slide in, 100vh each)
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    const scroller = scrollRef.current;
    const cards = cardRefs.current.filter((c): c is HTMLDivElement => c !== null);
    if (!scroller || cards.length !== STEPS.length) return;

    // matchMedia keeps each breakpoint's setup isolated and auto-reverts when the
    // viewport crosses the boundary — no stale desktop triggers left on mobile.
    const mm = gsap.matchMedia();

    // ── Desktop (lg+): horizontal stacked-card scroll ────────────────────────
    mm.add("(min-width: 1024px)", () => {
      // Step between consecutive cards, derived from the track's content width so
      // the last card lands flush right. Recomputed each refresh — never stale.
      let gap = 0;

      const measure = (): void => {
        const track = cards[0].parentElement;
        if (!track) return;
        const cs = getComputedStyle(track);
        const contentW =
          track.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        gap = Math.max(0, (contentW - cards[0].offsetWidth) / TRANSITIONS);
      };

      // First card flush left, the rest parked off-screen right.
      const setBase = (): void => {
        cards.forEach((card, i) =>
          gsap.set(card, {
            x: i === 0 ? 0 : window.innerWidth,
            y: 0,
            zIndex: i,
            autoAlpha: 1,
            force3D: true,
          }),
        );
      };

      measure();
      setBase();

      // CSS sticky (not GSAP pin) keeps the panel visible — no Lenis conflict.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: scroller,
          start: "top top",
          end: () => `+=${window.innerHeight * TRANSITIONS}`,
          scrub: 1, // Smooth catch-up easing
          invalidateOnRefresh: true,
          onRefreshInit: () => { measure(); setBase(); },
        },
      });

      // Each card slides in from the right and settles one gap past the previous,
      // stacking on top so older cards peek out on the left.
      cards.slice(1).forEach((card, i) => {
        tl.fromTo(
          card,
          { x: "100vw" },
          { x: () => gap * (i + 1), duration: 1 },
          i,
        );
      });
    });

    // ── Mobile / tablet (<lg): plain static cards, no animation ──────────────
    // Intentionally no GSAP here — cards render as a normal vertical stack.

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="bg-background">

      {/* Header — scrolls away before sticky panel takes focus */}
      <div className="page-container pb-12 pt-16 text-center md:pb-18 md:pt-24">
        <p className="text-label mb-3 text-primary">How it works</p>
        <h2 className="text-h1 text-balance text-foreground">
          Six steps to go from{" "}
          <span className="text-primary">curious to skilled</span>
        </h2>
        <p className="text-body mx-auto mt-4 max-w-sm text-muted-foreground">
          Everything you need — in one place.
        </p>
      </div>

      {/*
       * 600vh outer container — provides the scroll range ScrollTrigger measures.
       * The inner div is CSS sticky (not GSAP pin): no Lenis conflict, no fixed
       * positioning, no race conditions with scroll proxy.
       */}
      <div ref={scrollRef} className="lg:h-[600vh]">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
          <div className="page-container flex flex-col items-center gap-6 pb-12 lg:grid lg:h-full lg:items-center lg:justify-items-start lg:gap-0 lg:pb-0">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                ref={(el) => { cardRefs.current[index] = el; }}
                className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl lg:invisible lg:col-start-1 lg:row-start-1 lg:max-h-[88vh] lg:w-[780px] lg:max-w-none"
              >
                {/* Top bar */}
                <div className="flex items-center justify-between px-5 pb-3 pt-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                      <FontAwesomeIcon icon={step.icon} className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {step.tag}
                    </span>
                  </div>
                  <span className="font-display text-3xl font-bold leading-none text-foreground/[0.07] tabular-nums">
                    {step.number}
                  </span>
                </div>

                {/* Screenshot */}
                <CardImage src={step.imageSrc} alt={step.imageAlt} />

                {/* Text */}
                <div className="flex flex-col gap-1.5 px-5 pb-5 pt-4">
                  <h3 className="text-lg font-semibold leading-snug text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA — after 6-step guide */}
      <div className="page-container pb-16 pt-10 text-center md:pb-24">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/signup" />}
          className="rounded-full px-10 bg-primary text-white"
        >
          Start Learning Today
          <FontAwesomeIcon icon={faArrowRight} className="ml-1 h-3.5 w-3.5" />
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Free to join · No credit card needed
        </p>
      </div>

    </section>
  );
}
