"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeroSearch from "@/components/landing/shared/hero-search";

gsap.registerPlugin(useGSAP);

export default function UserHero(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".u-hero-item",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.09, ease: "power3.out", delay: 0.1, clearProps: "all" },
      );
    },
    { scope: containerRef },
  );

  return (
    <section className="relative z-20 pt-14 pb-6 md:pt-20 md:pb-10">

      {/* Background container with overflow-hidden to prevent dot grid/glow bleed */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Cool Attraction: Highlighted Dotted Canvas Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:24px_24px] opacity-65 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_40%,transparent_100%)] dark:bg-[radial-gradient(#4b5563_1px,transparent_1px)]" />

        {/* Cool Attraction: Ambient Accent Glows */}
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div ref={containerRef} className="page-container relative z-10">
        <div className="mx-auto max-w-3xl text-center">

          <h1 className="u-hero-item text-display text-balance text-foreground font-medium">
            India&apos;s{" "}
            <span className="text-primary">best creators,</span>
            <br />
            teaching what you actually need.
          </h1>

          <p className="u-hero-item text-body mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
            Browse courses, book 1-on-1 mentorship sessions, and join communities
            built by verified experts — all in one place.
          </p>

          <div className="u-hero-item relative z-10 mt-8 w-full px-1 text-left">
            <HeroSearch />
          </div>

        </div>
      </div>
    </section>
  );
}
