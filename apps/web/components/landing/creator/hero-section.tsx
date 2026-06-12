"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { VideoPlayer } from "@/components/landing/shared/video-player";

export default function HeroSection(): React.ReactElement {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative overflow-hidden bg-background pt-16 pb-12 md:pt-24 md:pb-16 transition-colors duration-500">

      {/* Background Animated Slanted Cards & Shooting Stars */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)"
        }}
      >
        
        {/* Soft ambient radial blue glow in the middle background, spread wider horizontally */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[550px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10 opacity-95 dark:opacity-65" />

        {/* Slanted Container rotated 40 degrees so everything travels from Top-Left to Bottom-Right */}
        <div className="absolute w-[200%] h-[200%] flex flex-col items-center justify-center rotate-[40deg]">
           
           {/* Global Dashed Grid covering the entire background */}
           <div
             className="absolute inset-0 opacity-60 dark:opacity-[0.25]"
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
                  className="absolute top-[25%] w-[320px] h-[1.5px] bg-gradient-to-r from-transparent to-primary flex items-center justify-end"
                >
                  <div className="w-[4px] h-[4px] rounded-full bg-white shadow-[0_0_18px_6px] shadow-primary" />
                </motion.div>

                {/* Meteor 2 (Subtle Primary - Middle top area) */}
                <motion.div
                  initial={{ left: "-20%" }}
                  animate={{ left: "120%" }}
                  transition={{ duration: 14, repeat: Infinity, ease: "linear", delay: 1 }}
                  className="absolute top-[35%] w-[200px] h-[1.5px] bg-gradient-to-r from-transparent to-primary/80 flex items-center justify-end"
                >
                  <div className="w-[3px] h-[3px] rounded-full bg-white shadow-[0_0_12px_4px] shadow-primary" />
                </motion.div>

                {/* Meteor 3 (Center area) */}
                <motion.div
                  initial={{ left: "-20%" }}
                  animate={{ left: "120%" }}
                  transition={{ duration: 11, repeat: Infinity, ease: "linear", delay: 3 }}
                  className="absolute top-[50%] w-[380px] h-[1.5px] bg-gradient-to-r from-transparent to-primary flex items-center justify-end"
                >
                  <div className="w-[4px] h-[4px] rounded-full bg-white shadow-[0_0_18px_6px] shadow-primary" />
                </motion.div>

                {/* Meteor 4 (Primary - Below center area) */}
                <motion.div
                  initial={{ left: "-20%" }}
                  animate={{ left: "120%" }}
                  transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 2.5 }}
                  className="absolute top-[65%] w-[240px] h-[1.5px] bg-gradient-to-r from-transparent to-primary/90 flex items-center justify-end"
                >
                  <div className="w-[3px] h-[3px] rounded-full bg-white shadow-[0_0_15px_4px] shadow-primary" />
                </motion.div>

                {/* Meteor 5 (Subtle Primary - Bottom far area) */}
                <motion.div
                  initial={{ left: "-20%" }}
                  animate={{ left: "120%" }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 5 }}
                  className="absolute top-[75%] w-[280px] h-[1.5px] bg-gradient-to-r from-transparent to-primary/70 flex items-center justify-end"
                >
                  <div className="w-[3px] h-[3px] rounded-full bg-white shadow-[0_0_12px_3px] shadow-primary" />
                </motion.div>
              </div>
           )}
        </div>
      </div>

      <div className="page-container relative z-10 flex flex-col items-center justify-center text-center">

        {/* Text Section */}
        <div className="relative z-20 w-full max-w-4xl mx-auto pt-6 pb-2 flex flex-col items-center">

          {/* Highlighted Beam Path perfectly anchored behind the text */}
          <div
            className="absolute top-[45%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[220px] border-y border-primary/20 dark:border-primary/10 bg-primary/[0.01] backdrop-blur-[2px] shadow-[0_0_80px_rgba(0,100,255,0.06)] dark:shadow-[0_0_150px_rgba(0,100,255,0.25)] rotate-[40deg] pointer-events-none -z-10 flex items-center overflow-hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent 5%, black 25%, black 75%, transparent 95%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 5%, black 25%, black 75%, transparent 95%)"
            }}
          />

          <h1 className="relative z-10 text-display text-balance text-foreground font-normal tracking-tight">
            Turn your expertise into{" "}
            <span className="text-primary font-normal">a real business.</span>
          </h1>

          <p className="relative z-10 mx-auto mt-6 max-w-xl text-balance text-muted-foreground font-light text-base md:text-lg leading-relaxed">
            Sell courses, host 1-on-1 sessions, build a paid community — all from one profile. No studio, no team, no gatekeepers.
          </p>

          {/* CTAs */}
          <div className="relative z-10 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 w-full">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/signup" />}
              className="h-14 w-full sm:w-auto rounded-full bg-foreground px-10 text-base font-normal text-background hover:bg-primary hover:text-white transition-colors duration-300 shadow-md"
            >
              Start your's
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3.5 w-3.5" />
            </Button>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="#how-it-works" />}
              className="h-14 w-full sm:w-auto rounded-full bg-background/60 border border-border/50 text-foreground hover:bg-accent hover:text-accent-foreground px-10 text-base font-normal transition-all shadow-sm"
            >
              See How It Works
            </Button>
          </div>
        </div>
        {/* Product demo video inside Mockup Frame */}
        <div className="relative mt-10 w-full z-20">
          <div className="rounded-[2rem] border border-border/50 bg-card/80 backdrop-blur-xl p-2.5 shadow-2xl md:p-5 lg:rounded-[3rem]">
            <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-background lg:rounded-[2rem] shadow-inner border border-border/30">
              <VideoPlayer
                src="/videos/demo.mp4"
                poster="/images/demo-poster.jpg"
                size="full"
                className="rounded-2xl w-full h-full object-cover"
                autoPlay
                muted
                loop
                preload="metadata"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

