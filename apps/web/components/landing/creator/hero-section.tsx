"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HeroSection(): React.ReactElement {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-background pt-32 pb-20 md:pt-40 md:pb-40 transition-colors duration-500">
      
      {/* Background Animated Slanted Cards & Shooting Stars (Thokachukkalu) */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center"
        style={{
          // This mask ensures the animation is fully visible at the top-left but completely disappears before the tablet image
          maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 70%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 70%)"
        }}
      >
        
        {/* Slanted Container rotated 40 degrees so everything travels from Top-Left to Bottom-Right */}
        <div className="absolute w-[200%] h-[200%] flex flex-col items-center justify-center rotate-[40deg]">
           
           {/* Global Dashed Grid covering the entire background */}
           <div 
             className="absolute inset-0 opacity-40 dark:opacity-[0.15]" 
             style={{ 
               backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 120px, hsl(var(--border)) 120px, hsl(var(--border)) 121px)' 
             }} 
           />

           {/* Meteors falling across ALL areas of the screen */}
           {mounted && (
              <div className="absolute inset-0 pointer-events-none">
                  {/* Meteor 1 (Primary - Top area) */}
                  <motion.div
                    initial={{ left: "-20%" }}
                    animate={{ left: "120%" }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 0 }}
                    className="absolute top-[25%] w-[400px] h-px bg-gradient-to-r from-transparent to-primary flex items-center justify-end"
                  >
                     <div className="w-[3px] h-[3px] rounded-full bg-primary shadow-[0_0_15px_4px] shadow-primary" />
                  </motion.div>
                  
                  {/* Meteor 2 (Subtle Primary - Middle top area) */}
                  <motion.div
                    initial={{ left: "-20%" }}
                    animate={{ left: "120%" }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear", delay: 1 }}
                    className="absolute top-[35%] w-[250px] h-px bg-gradient-to-r from-transparent to-primary/60 flex items-center justify-end"
                  >
                     <div className="w-[2px] h-[2px] rounded-full bg-primary/80 shadow-[0_0_10px_2px] shadow-primary" />
                  </motion.div>

                  {/* Meteor 3 (Center area) */}
                  <motion.div
                    initial={{ left: "-20%" }}
                    animate={{ left: "120%" }}
                    transition={{ duration: 11, repeat: Infinity, ease: "linear", delay: 3 }}
                    className="absolute top-[50%] w-[500px] h-px bg-gradient-to-r from-transparent to-primary flex items-center justify-end"
                  >
                     <div className="w-[2px] h-[2px] rounded-full bg-primary shadow-[0_0_12px_4px] shadow-primary/60" />
                  </motion.div>
                  
                  {/* Meteor 4 (Primary - Below center area) */}
                  <motion.div
                    initial={{ left: "-20%" }}
                    animate={{ left: "120%" }}
                    transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 2.5 }}
                    className="absolute top-[65%] w-[300px] h-px bg-gradient-to-r from-transparent to-primary flex items-center justify-end"
                  >
                     <div className="w-[3px] h-[3px] rounded-full bg-primary shadow-[0_0_15px_4px] shadow-primary" />
                  </motion.div>

                  {/* Meteor 5 (Subtle Primary - Bottom far area) */}
                  <motion.div
                    initial={{ left: "-20%" }}
                    animate={{ left: "120%" }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 5 }}
                    className="absolute top-[75%] w-[350px] h-px bg-gradient-to-r from-transparent to-primary/50 flex items-center justify-end"
                  >
                     <div className="w-[2px] h-[2px] rounded-full bg-primary/80 shadow-[0_0_10px_2px] shadow-primary/50" />
                  </motion.div>
              </div>
           )}
        </div>
      </div>

      <div className="page-container relative z-10 flex flex-col items-center justify-center text-center">

        {/* Text Section */}
        <div className="relative z-20 w-full max-w-4xl mx-auto py-16 flex flex-col items-center">
          
          {/* Highlighted Beam Path perfectly anchored behind the text */}
          <div 
            className="absolute top-[45%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200px] border-y border-border/50 dark:border-border/30 bg-foreground/[0.01] backdrop-blur-[2px] shadow-[0_0_40px_rgba(0,0,0,0.03)] dark:shadow-[0_0_80px_rgba(0,0,0,0.5)] rotate-[40deg] pointer-events-none -z-10 flex items-center overflow-hidden" 
            style={{
              maskImage: "linear-gradient(to right, transparent 20%, black 40%, black 50%, transparent 65%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 20%, black 40%, black 50%, transparent 65%)"
            }}
          />

          <h1 className="relative z-10 mx-auto max-w-3xl text-xl font-medium leading-relaxed tracking-wide text-foreground/90 sm:text-2xl md:text-[28px] md:leading-snug text-balance">
            The all-in-one business OS for Indian creators. Sell courses, host 1-on-1 sessions, and build paid communities.
          </h1>

          {/* CTAs */}
          <div className="relative z-10 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 w-full">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/signup" />}
              className="h-14 w-full sm:w-auto rounded-full bg-foreground px-10 text-base font-bold text-background hover:bg-primary hover:text-white transition-colors duration-300 shadow-md"
            >
              Claim your profile
            </Button>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="#demo" />}
              className="h-14 w-full sm:w-auto rounded-full bg-background/60 border border-border/50 text-foreground hover:bg-accent hover:text-accent-foreground px-10 text-base font-bold transition-all shadow-sm"
            >
              Explore features
            </Button>
          </div>
        </div>

        {/* Massive Tablet Mockup */}
        <div className="relative mt-20 w-full max-w-[1100px] lg:mt-32 z-20">
           <div className="rounded-[2rem] border border-border/50 bg-card/80 backdrop-blur-xl p-3 shadow-2xl md:p-6 lg:rounded-[3rem]">
             <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-background lg:rounded-[2rem] shadow-inner border border-border/30">
                <Image
                  src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1600&q=80"
                  alt="Platform Interface"
                  fill
                  className="object-cover"
                />
             </div>
           </div>
        </div>

      </div>
      
      {/* Subtle bottom fade to blend with next section */}
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
}
