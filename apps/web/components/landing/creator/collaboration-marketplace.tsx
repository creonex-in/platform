"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils";
import {
  faMagnifyingGlass,
  faFileLines,
  faHandshake,
  faRocket,
  faCoins,
  faUsers,
  faLaptopCode,
  faBullhorn,
  faLink,
} from "@fortawesome/free-solid-svg-icons";

// Pastel accent palette — cycled across steps & use-case icons for a clean,
// professional multi-colour look on a light background.
const PASTELS = [
  "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100",
  "bg-violet-50 text-violet-600 border-violet-100 group-hover:bg-violet-100",
  "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100",
  "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100",
  "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100",
];

const STEPS = [
  { num: "01", icon: faMagnifyingGlass, title: "Find Partners", desc: "Search creators by niche & audience size" },
  { num: "02", icon: faFileLines, title: "Propose Splits", desc: "Pitch revenue split & project details" },
  { num: "03", icon: faHandshake, title: "Agree on terms", desc: "Agree on split percentages securely" },
  { num: "04", icon: faRocket, title: "Launch Together", desc: "Publish joint courses or webinars" },
  { num: "05", icon: faCoins, title: "Auto-Payout", desc: "Earnings split instantly in real-time" },
];

const USE_CASES: { icon: IconDefinition; title: string; desc: string; iconClass: string }[] = [
  {
    icon: faUsers,
    title: "Co-Created Courses",
    desc: "Build and sell a course with a partner. Split the lesson creation work and double your launch audience.",
    iconClass: PASTELS[0],
  },
  {
    icon: faLaptopCode,
    title: "Joint Live Bootcamps",
    desc: "Host joint workshops or masterclasses. Teach together in real-time and split registration revenue.",
    iconClass: PASTELS[1],
  },
  {
    icon: faBullhorn,
    title: "Partner Referrals",
    desc: "Let other creators promote your digital products and templates for an automated percentage split.",
    iconClass: PASTELS[2],
  },
  {
    icon: faLink,
    title: "Cross-Promotional Bundles",
    desc: "Combine your templates or templates with another creator for a higher-converting joint package.",
    iconClass: PASTELS[3],
  },
];

export default function CollaborationMarketplace(): React.ReactElement {
  return (
    <section className="relative overflow-hidden border-t border-slate-200/70 bg-gradient-to-b from-[#f6f8ff] via-[#f3f6fd] to-[#eef3fb] py-20 md:py-28">
      {/* Soft pastel glows */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-[500px] w-[500px] -z-10 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.10)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute top-1/3 right-0 h-[420px] w-[420px] -z-10 bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.10)_0%,transparent_70%)]" />

      <div className="page-container relative z-10">

        {/* ── Header ── */}
        <div className="mb-16 md:mb-24 flex flex-col items-center text-center max-w-3xl mx-auto px-4">
          <p className="text-label text-primary mb-5 font-mono tracking-widest text-xs md:text-sm">Collaboration Marketplace</p>

          <h2 className="text-h1 text-balance text-zinc-900 mb-6 font-display tracking-tight leading-tight">
            Collaborate with peers.<br />
            <span className="text-zinc-400">Double your launch audience.</span>
          </h2>

          <p className="text-body max-w-2xl mx-auto leading-relaxed text-zinc-500 font-light">
            A structured marketplace to easily find co-creators, negotiate revenue splits, and launch joint packages. The platform handles all payouts in real-time.
          </p>
        </div>

        {/* ── Collaboration Diagram Mockup (Completely Responsive & Solid) ── */}
        <div className="w-full mb-16 md:mb-28 relative select-none">
          {/* Browser Window Frame Mockup */}
          <div className="border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-[0_24px_64px_-24px_rgba(30,41,59,0.20)]">

            {/* Browser Header Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between gap-4">
              {/* Window Controls (Apple colors) */}
              <div className="flex gap-2 shrink-0">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>

              {/* Mock Address Bar */}
              <div className="flex-1 max-w-lg mx-auto bg-white border border-slate-200 rounded-xl py-1.5 px-4 flex items-center justify-between text-xs text-zinc-400 select-none">
                <span className="truncate font-mono tracking-tight text-[11px] md:text-xs">creonex.in/dashboard/revenue-splits/joint-masterclass</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Settlement Live
                </span>
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 font-medium shrink-0">
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-600">Active</span>
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="p-3.5 sm:p-6 md:p-10 bg-slate-50">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-stretch">

                {/* ── Left Column: Revenue Split Console ── */}
                <div className="lg:col-span-5 flex flex-col gap-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2.5 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Split Settings
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1.5 font-light">Set custom shares and verify the partnership configuration.</p>
                  </div>

                  {/* Joint Product Card (Realistic Thumbnail) */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group relative">
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80"
                        alt="Next-Gen UI/UX & React Bootcamp Cover"
                        fill
                        className="object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 via-transparent to-transparent pointer-events-none" />

                      {/* Badges */}
                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-semibold uppercase px-2.5 py-1 rounded tracking-widest shadow-md">
                        Live Bootcamp
                      </span>
                      <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-zinc-700 text-xs font-semibold px-2 py-1 rounded border border-slate-200">
                        12 Weeks
                      </span>
                    </div>

                    <div className="p-5">
                      <h4 className="text-base font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        Next-Gen UI/UX & React Masterclass
                      </h4>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-zinc-500 font-light">Product Price</span>
                        <span className="text-sm font-semibold text-zinc-800">₹10,000 / sale</span>
                      </div>
                    </div>
                  </div>

                  {/* Creators Split Settings */}
                  <div className="space-y-5">
                    {/* Creator A Split */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="font-medium text-zinc-600">Anya Sen (UI/UX lead)</span>
                        <span className="font-semibold text-zinc-800">60% Share (₹6,000)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full relative">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: "60%" }} />
                        <div className="absolute top-1/2 -translate-y-1/2 left-[60%] w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-400 -translate-x-1/2 shadow-md cursor-pointer hover:scale-110 transition-transform" />
                      </div>
                    </div>

                    {/* Creator B Split */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="font-medium text-zinc-600">Rohan Verma (React lead)</span>
                        <span className="font-semibold text-zinc-800">40% Share (₹4,000)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full relative">
                        <div className="h-full bg-violet-400 rounded-full" style={{ width: "40%" }} />
                        <div className="absolute top-1/2 -translate-y-1/2 left-[40%] w-3.5 h-3.5 rounded-full bg-white border-2 border-violet-400 -translate-x-1/2 shadow-md cursor-pointer hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature Badge */}
                  <div className="mt-2 p-3 sm:p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
                    <svg className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-left w-full">
                      <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-emerald-700">Co-Creator Terms Signed</p>
                      <p className="text-[10px] sm:text-xs text-emerald-600/80 font-light mt-0.5 leading-relaxed">Automated contract terms signed digitally by both creators.</p>
                    </div>
                  </div>

                </div>

                {/* ── Right Column: Real-Time Payout Routing ── */}
                <div className="lg:col-span-7 flex flex-col justify-between gap-6 sm:gap-8 border border-slate-200 bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm relative overflow-hidden">

                  {/* Decorative grid pattern */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.04] text-slate-400">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="gridPatternMono" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#gridPatternMono)" />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2.5 uppercase tracking-wider">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Payout Routing
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-500 mt-1.5 font-light">Watch how every single student purchase splits and routes instantly.</p>
                  </div>

                  {/* Flow Diagram Box */}
                  <div className="relative z-10 my-4 flex flex-col items-center gap-5 sm:gap-8 w-full">

                    {/* Top Node: Sale Incoming */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-md w-full max-w-sm relative z-20 group hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-zinc-400 truncate">Gateway Payment Received</p>
                          <h4 className="text-xs sm:text-sm font-semibold text-zinc-800 mt-0.5 truncate">Order #CRN-9840</h4>
                        </div>
                        <div className="text-right shrink-0 font-mono">
                          <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-1 rounded border border-emerald-100">+₹10,005</span>
                        </div>
                      </div>
                    </div>

                    {/* Branching curves connection (Fully Responsive) */}
                    <div className="flex w-full max-w-lg relative h-14 sm:h-20 justify-center items-center">
                      {/* Connection Lines (SVG) */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        {/* Background Path (Light) */}
                        <path d="M200,0 L200,30 L60,30 L60,80" stroke="currentColor" strokeWidth="1" className="text-slate-200" />
                        <path d="M200,0 L200,30 L340,30 L340,80" stroke="currentColor" strokeWidth="1" className="text-slate-200" />

                        {/* Animated Glowing Paths */}
                        <path d="M200,0 L200,30 L60,30 L60,80" stroke="url(#split-grad-left)" strokeWidth="1.5" strokeDasharray="6 12" className="animate-flow-left" />
                        <path d="M200,0 L200,30 L340,30 L340,80" stroke="url(#split-grad-right)" strokeWidth="1.5" strokeDasharray="6 12" className="animate-flow-right" />

                        {/* Gradients */}
                        <defs>
                          <linearGradient id="split-grad-left" x1="200" y1="0" x2="60" y2="80" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#93c5fd" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                          <linearGradient id="split-grad-right" x1="200" y1="0" x2="340" y2="80" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#c4b5fd" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Live Split Router Badge */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-full px-3.5 py-1.5 shadow-lg flex items-center gap-1.5 z-10 select-none">
                        <FontAwesomeIcon icon={faCoins} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 animate-bounce" />
                        <span className="text-[9px] sm:text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Auto Router</span>
                      </div>
                    </div>

                    {/* Responsive Payout Destinations (Side-by-side Grid) */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full relative z-20">

                      {/* Anya Sen's share box */}
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-2.5 sm:gap-4 shadow-sm hover:border-blue-200 transition-all w-full">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left w-full min-w-0">
                          <div className="relative w-8 h-8 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-slate-200 shrink-0">
                            <Image
                              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
                              alt="Anya Sen"
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 32px, 56px"
                            />
                          </div>
                          <div className="flex-1 min-w-0 w-full">
                            <p className="text-[11px] sm:text-sm font-semibold text-zinc-800 truncate">Anya Sen</p>
                            <span className="text-[9px] sm:text-xs text-zinc-500 font-light block mt-0.5">60% split</span>
                            <span className="sm:hidden text-[11px] font-semibold text-emerald-700 font-mono mt-0.5 block">+₹6,000</span>
                          </div>
                          <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-emerald-700 font-mono shrink-0">
                            +₹6,000
                          </span>
                        </div>

                        <div className="border-t border-slate-100 sm:border-t-0 w-full pt-1.5 sm:pt-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-[9px] sm:text-xs gap-1 shrink-0">
                          <span className="text-zinc-500 flex items-center gap-1 font-light">
                            <svg className="w-2.5 h-2.5 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            HDFC
                          </span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-1 font-mono">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping shrink-0" /> Settled
                          </span>
                        </div>
                      </div>

                      {/* Rohan Verma's share box */}
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-2.5 sm:gap-4 shadow-sm hover:border-violet-200 transition-all w-full">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left w-full min-w-0">
                          <div className="relative w-8 h-8 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-slate-200 shrink-0">
                            <Image
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
                              alt="Rohan Verma"
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 32px, 56px"
                            />
                          </div>
                          <div className="flex-1 min-w-0 w-full">
                            <p className="text-[11px] sm:text-sm font-semibold text-zinc-800 truncate">Rohan Verma</p>
                            <span className="text-[9px] sm:text-xs text-zinc-500 font-light block mt-0.5">40% split</span>
                            <span className="sm:hidden text-[11px] font-semibold text-emerald-700 font-mono mt-0.5 block">+₹4,000</span>
                          </div>
                          <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-emerald-700 font-mono shrink-0">
                            +₹4,000
                          </span>
                        </div>

                        <div className="border-t border-slate-100 sm:border-t-0 w-full pt-1.5 sm:pt-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-[9px] sm:text-xs gap-1 shrink-0">
                          <span className="text-zinc-500 flex items-center gap-1 font-light">
                            <svg className="w-2.5 h-2.5 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            ICICI
                          </span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-1 font-mono">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping shrink-0" /> Settled
                          </span>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Auto-split footer info */}
                  <div className="text-center text-xs md:text-sm text-zinc-500 border-t border-slate-200 pt-4 font-medium flex items-center justify-center gap-2.5 relative z-10">
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Split payouts are routed instantly in real-time to each creator&apos;s bank account. No manual tracking, no split disputes.
                  </div>

                </div>

              </div>
            </div>

            {/* Embedded styles for moving flow lines */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes flowLeft {
                from { stroke-dashoffset: 18; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes flowRight {
                from { stroke-dashoffset: 18; }
                to { stroke-dashoffset: 0; }
              }
              .animate-flow-left {
                animation: flowLeft 1s linear infinite;
              }
              .animate-flow-right {
                animation: flowRight 1s linear infinite;
              }
            `}} />

          </div>
        </div>

        {/* ── Workflow Stepper (Completely Responsive: Grid on Desktop, Custom Vertical Timeline on Mobile) ── */}
        <div className="mb-12">

          {/* Desktop/Tablet Stepper (Hidden on Mobile) */}
          <div className="hidden md:grid grid-cols-5 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex flex-col items-center text-center group">
                <div className="relative mb-5">
                  <div className={cn("w-12 h-12 rounded-full border flex items-center justify-center shadow-sm transition-all", PASTELS[i % PASTELS.length])}>
                    <FontAwesomeIcon icon={step.icon} className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-zinc-600 flex items-center justify-center select-none shadow">
                    {step.num}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-zinc-800 mb-3 uppercase tracking-wider group-hover:text-zinc-900 transition-colors">{step.title}</h4>
                <p className="text-xs md:text-sm text-zinc-500 leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile Stepper (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col gap-10 relative pl-8 border-l border-slate-200 ml-4">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative text-left">
                {/* Icon Circle centered exactly on the line */}
                <div className={cn("absolute -left-[48px] top-0.5 w-8 h-8 rounded-full border flex items-center justify-center shadow-md", PASTELS[i % PASTELS.length])}>
                  <FontAwesomeIcon icon={step.icon} className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider">{step.num} //</span>
                    <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-widest">{step.title}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-light mt-1.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── Use Cases (Pastel cards) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {USE_CASES.map((uc) => (
            <div key={uc.title} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
              <div className={cn("mb-6 flex size-12 items-center justify-center rounded-xl border transition-all duration-200", uc.iconClass)}>
                <FontAwesomeIcon icon={uc.icon} className="size-5" />
              </div>
              <h4 className="text-base font-semibold text-zinc-900 mb-3 transition-colors">{uc.title}</h4>
              <p className="text-xs md:text-sm text-zinc-500 leading-relaxed font-light">{uc.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
