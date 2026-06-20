"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowRight, 
  faMobileScreenButton, 
  faCheck,
  faCoins,
  faChartLine,
  faMessage
} from "@fortawesome/free-solid-svg-icons";
import { faApple, faGooglePlay } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";

export default function MobileAppSection(): React.ReactElement {
  return (
    <section className="bg-background py-24 relative overflow-hidden border-t border-border/10">
      
      <div className="page-container relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-evenly gap-8 lg:gap-10">
          
          {/* Left Side: Minimal Copy */}
          <div className="flex-1 max-w-xl  text-center lg:text-left">
            <p className="text-label text-primary mb-5 flex items-center gap-2 justify-center lg:justify-start font-sans">
               <FontAwesomeIcon icon={faMobileScreenButton} className="w-3.5 h-3.5" />
               Coming 2026
            </p>
            
            <h2 className="text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-foreground mb-6 leading-tight font-display">
              Your entire creator business. <br className="hidden md:block"/> In your pocket.
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light font-sans">
              Manage bookings, track live earnings, and engage with your community from a single, beautifully designed application. No laptop required.
            </p>

            {/* Simple Feature List using Soft Pastels */}
            <ul className="space-y-4 mb-12 text-left max-w-md mx-auto lg:mx-0 font-sans">
               <li className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#f4fff9] dark:bg-[#1a3a2a]/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-900/30 shrink-0 shadow-sm">
                     <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                  </div>
                  <span className="font-light text-muted-foreground">Live earnings and session analytics</span>
               </li>
               <li className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#f4f7ff] dark:bg-[#1a233a]/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30 shrink-0 shadow-sm">
                     <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                  </div>
                  <span className="font-light text-muted-foreground">Accept and manage bookings on the fly</span>
               </li>
               <li className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#fbf4ff] dark:bg-[#231a3a]/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100/50 dark:border-purple-900/30 shrink-0 shadow-sm">
                     <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                  </div>
                  <span className="font-light text-muted-foreground">Built-in community messaging</span>
               </li>
            </ul>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 font-sans">
               <Button size="lg" className="rounded-full px-8 gap-2 font-bold bg-foreground hover:bg-muted-foreground text-background h-12 shadow-sm transition-all duration-300">
                 Join Waitlist <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
               </Button>
               
               <div className="flex items-center gap-4 opacity-40 grayscale pointer-events-none text-foreground">
                  <FontAwesomeIcon icon={faApple} className="h-6 w-6" />
                  <FontAwesomeIcon icon={faGooglePlay} className="h-5 w-5" />
               </div>
            </div>
          </div>

          {/* Right Side: Ultra-Minimal Abstract Mockup with Hardware Frame */}
          <div className="flex-1 w-full max-w-md relative flex justify-center  lg:justify-end">
            {/* Phone background ambient glow */}
            <div className="absolute top-1/2 left-1/2 lg:left-2/3 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-100/60 dark:bg-indigo-950/20 rounded-full blur-[80px] pointer-events-none" />

            <motion.div 
               animate={{ y: [-8, 8, -8] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="relative w-[280px] h-[580px] bg-card border-[10px] md:border-[12px] border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden ring-1 ring-border/50 z-10"
            >
               {/* Hardware Details (Volume/Power Buttons) */}
               <div className="absolute top-28 -left-3 w-3 h-10 bg-slate-300 dark:bg-slate-700 rounded-l-sm" />
               <div className="absolute top-44 -left-3 w-3 h-14 bg-slate-300 dark:bg-slate-700 rounded-l-sm" />
               <div className="absolute top-36 -right-3 w-3 h-16 bg-slate-300 dark:bg-slate-700 rounded-r-sm" />

               {/* Dynamic Island */}
               <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-50 flex items-center justify-between px-2.5 shadow-inner">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-900/50 flex items-center justify-center">
                    <div className="h-0.5 w-0.5 rounded-full bg-emerald-500" />
                 </div>
                 <div className="h-2 w-2 rounded-full bg-[#1a1a1a]" />
               </div>

               {/* Sleek Header */}
               <div className="w-full pt-16 pb-6 px-6 flex flex-col items-center">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold font-sans">Total Balance</p>
                  <h3 className="text-4xl font-extrabold text-foreground tracking-tight font-display">₹1,42,500</h3>
               </div>

               {/* Clean Graph Area using Pastel Indigo */}
               <div className="w-full h-32 relative flex items-end px-4 gap-2 pb-2">
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-50/50 dark:from-indigo-950/10 to-transparent" />
                   {[20, 35, 25, 50, 45, 75, 60, 40, 85, 70].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-indigo-300/40 dark:bg-indigo-500/20 border-t border-indigo-300/40 dark:border-indigo-500/30 rounded-t-sm" 
                        style={{ height: `${h}%` }}
                      />
                   ))}
               </div>

               {/* Mock Dashboard Action Items */}
               <div className="flex-1 w-full p-4.5 space-y-4 mt-3 font-sans">
                  {/* Item 1: Booking split payout */}
                  <div className="w-full flex items-center justify-between p-2.5 bg-background rounded-xl border border-border/60">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center border border-indigo-100/60 dark:border-indigo-900/30 text-xs shrink-0">
                           <FontAwesomeIcon icon={faCoins} />
                        </div>
                        <div>
                           <h4 className="text-[11px] font-bold text-foreground leading-tight">UI Boot camp</h4>
                           <span className="text-[9px] text-muted-foreground">Split routing</span>
                        </div>
                     </div>
                     <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">+₹4,000</span>
                  </div>

                  {/* Item 2: Mentorship slot booked */}
                  <div className="w-full flex items-center justify-between p-2.5 bg-background rounded-xl border border-border/60">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100/60 dark:border-emerald-900/30 text-xs shrink-0">
                           <FontAwesomeIcon icon={faChartLine} />
                        </div>
                        <div>
                           <h4 className="text-[11px] font-bold text-foreground leading-tight">1-on-1 Session</h4>
                           <span className="text-[9px] text-muted-foreground">Booked by Anya</span>
                        </div>
                     </div>
                     <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">+₹1,500</span>
                  </div>

                  {/* Item 3: Community message */}
                  <div className="w-full flex items-center justify-between p-2.5 bg-background rounded-xl border border-border/60">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100/60 dark:border-purple-900/30 text-xs shrink-0">
                           <FontAwesomeIcon icon={faMessage} />
                        </div>
                        <div>
                           <h4 className="text-[11px] font-bold text-foreground leading-tight">Student Circle</h4>
                           <span className="text-[9px] text-muted-foreground">New community message</span>
                        </div>
                     </div>
                     <span className="text-[10px] text-muted-foreground font-medium">Just now</span>
                  </div>
               </div>
               
               {/* Minimal Home Indicator */}
               <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-border/50 rounded-full z-50" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}