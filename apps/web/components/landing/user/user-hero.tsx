"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HeroSearch from "@/components/landing/shared/hero-search";

export default function UserHero(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  return (
    <section className="relative z-20 pt-10 pb-6 md:pt-16 md:pb-10 overflow-hidden bg-background">
      <div className="page-container relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-sm border border-border">
          
          <div className="flex-1 text-left">
            <h1 className="text-display text-balance text-foreground font-bold leading-tight">
              Jump into learning <br className="hidden md:block" />
              with India&apos;s best creators
            </h1>
            
            <p className="text-body mt-4 max-w-xl text-balance text-muted-foreground">
              Browse premium courses, book 1-on-1 mentorship sessions, and join communities 
              built by verified industry experts - all in one place.
            </p>

            <div className="relative z-10 mt-8 w-full max-w-md">
              <HeroSearch
                onSearch={(q) => router.push(`/explore?q=` + encodeURIComponent(q))}
              />
            </div>
          </div>

          <div className="flex-1 relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg border border-border">
            {/* Using a placeholder premium learning image from Unsplash */}
            <Image 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
              alt="Students learning and collaborating"
              fill
              className="object-cover"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}
