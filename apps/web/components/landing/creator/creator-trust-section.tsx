"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const CREATORS_ROW_1 = [
  { name: "Aarav S.", niche: "Finance Coaching", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { name: "Priya M.", niche: "UI/UX Design", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
  { name: "Rohan K.", niche: "Web Development", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
  { name: "Neha P.", niche: "Fitness Training", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { name: "Vikram D.", niche: "Growth Marketing", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" },
  { name: "Aditi R.", niche: "Language Tutor", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
];

const CREATORS_ROW_2 = [
  { name: "Karthik N.", niche: "Music Production", image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80" },
  { name: "Sneha V.", niche: "Digital Art", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
  { name: "Arjun T.", niche: "Tech Reviews", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" },
  { name: "Meera J.", niche: "Yoga & Mindfulness", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" },
  { name: "Rahul B.", niche: "Startup Consulting", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80" },
  { name: "Ananya C.", niche: "Culinary Arts", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80" },
];

export default function CreatorTrustSection() {
  return (
    <section className="bg-background py-20 overflow-hidden relative border-b border-border/10">
      
      {/* Very subtle background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[200px] bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="page-container relative z-10 mb-16">
        {/* Problem / Solution Statement */}
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-muted-foreground leading-[1.3] text-balance">
            Stop paying for Zoom, Calendly, Razorpay, and Teachable separately. <br className="hidden md:block" />
            <span className="text-foreground">Welcome to the all-in-one Creator OS.</span>
          </h2>
        </div>
      </div>

      {/* Massive Avatar Marquee Section */}
      <div className="relative flex flex-col items-center w-full">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center px-4">
          Join 10,000+ Indian Creators building their empires
        </p>
        
        <div 
          className="w-full relative flex flex-col gap-4 md:gap-6 overflow-hidden py-4"
          style={{ 
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
          }}
        >
          {/* Row 1 - Moves Left */}
          <motion.div 
            className="flex whitespace-nowrap items-center gap-4 md:gap-6 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
          >
            {[...CREATORS_ROW_1, ...CREATORS_ROW_1, ...CREATORS_ROW_1].map((creator, i) => (
              <div key={`r1-${i}`} className="flex items-center gap-3 bg-card border border-border/60 hover:border-primary/40 transition-colors rounded-full py-2 px-3 pr-6 shadow-sm shrink-0">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden relative shrink-0 bg-muted">
                    <Image src={creator.image} alt={creator.name} fill className="object-cover" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm md:text-base font-bold text-foreground leading-none">{creator.name}</span>
                    <span className="text-[11px] md:text-xs text-muted-foreground font-medium mt-1.5">{creator.niche}</span>
                 </div>
              </div>
            ))}
          </motion.div>

          {/* Row 2 - Moves Right */}
          <motion.div 
            className="flex whitespace-nowrap items-center gap-4 md:gap-6 w-max ml-[-200px]"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
          >
            {[...CREATORS_ROW_2, ...CREATORS_ROW_2, ...CREATORS_ROW_2].map((creator, i) => (
              <div key={`r2-${i}`} className="flex items-center gap-3 bg-card border border-border/60 hover:border-primary/40 transition-colors rounded-full py-2 px-3 pr-6 shadow-sm shrink-0">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden relative shrink-0 bg-muted">
                    <Image src={creator.image} alt={creator.name} fill className="object-cover" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm md:text-base font-bold text-foreground leading-none">{creator.name}</span>
                    <span className="text-[11px] md:text-xs text-muted-foreground font-medium mt-1.5">{creator.niche}</span>
                 </div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>

    </section>
  );
}
