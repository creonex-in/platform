"use client";

import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faIndianRupeeSign,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type SessionStatus = "Popular" | "Few Spots Left" | "Trending" | "New";

type Session = {
  id: string;
  expert: { name: string; role: string; initials: string; avatar: string };
  topic: string;
  month: string;
  day: string;
  time: string;
  price: number;
  status: SessionStatus;
  category: "Design" | "Engineering" | "Career";
};

const FILTERS = ["All", "Design", "Engineering", "Career"] as const;
type Filter = (typeof FILTERS)[number];

// ── Data ──────────────────────────────────────────────────────────────────────

const SESSIONS: Session[] = [
  {
    id: "s1",
    expert: { name: "Sarah Johnson", role: "Senior Product Designer @ Google", initials: "SJ", avatar: "/creator-profiles/raj.png" },
    topic: "UI/UX Portfolio Review",
    month: "JUN", day: "14", time: "7:00 PM IST", price: 999,
    status: "Popular", category: "Design",
  },
  {
    id: "s2",
    expert: { name: "Rahul Verma", role: "Frontend Engineer @ Microsoft", initials: "RV", avatar: "/creator-profiles/raj.png" },
    topic: "React Interview Preparation",
    month: "JUN", day: "15", time: "6:30 PM IST", price: 799,
    status: "Few Spots Left", category: "Engineering",
  },
  {
    id: "s3",
    expert: { name: "Priya Sharma", role: "Engineering Manager @ Amazon", initials: "PS", avatar: "/creator-profiles/raj.png" },
    topic: "System Design Fundamentals",
    month: "JUN", day: "16", time: "8:00 PM IST", price: 1299,
    status: "Trending", category: "Engineering",
  },
  {
    id: "s4",
    expert: { name: "Arjun Mehta", role: "Senior Software Engineer @ Adobe", initials: "AM", avatar: "/creator-profiles/raj.png" },
    topic: "Career Growth for Developers",
    month: "JUN", day: "17", time: "5:00 PM IST", price: 699,
    status: "New", category: "Career",
  },
];

const STATUS_CLASS: Record<SessionStatus, string> = {
  "Popular":        "border-foreground/20 bg-foreground/5 text-foreground",
  "Few Spots Left": "border-destructive/20 bg-destructive/5 text-destructive",
  "Trending":       "border-foreground/20 bg-foreground/5 text-foreground",
  "New":            "border-border bg-secondary text-secondary-foreground",
};

const STATUS_DOT: Record<SessionStatus, string> = {
  "Popular":        "bg-foreground",
  "Few Spots Left": "animate-pulse bg-destructive",
  "Trending":       "bg-foreground",
  "New":            "bg-muted-foreground",
};

// ── Expert avatar ─────────────────────────────────────────────────────────────

function ExpertAvatar({ expert }: { expert: Session["expert"] }): React.ReactElement {
  const [errored, setErrored] = useState(false);

  return (
    <div className="relative shrink-0">
      {!errored ? (
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border/80 group-hover:border-foreground/40 transition-colors duration-300">
          <Image
            src={expert.avatar}
            alt={expert.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="40px"
            onError={() => setErrored(true)}
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-foreground/5 text-xs font-bold text-foreground group-hover:border-foreground/40 transition-colors duration-300">
          {expert.initials}
        </div>
      )}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
    </div>
  );
}

// ── Session card ──────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: Session }): React.ReactElement {
  return (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/85 bg-card/60 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-foreground/40 hover:bg-card hover:shadow-lg hover:shadow-foreground/5 animate-fade-up">
      
      {/* Subtle top light effect */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-foreground/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="flex flex-col gap-3">
        {/* Top Header: Calendar Badge & Status Pill */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center justify-center rounded-xl bg-foreground/5 px-2.5 py-1.5 text-foreground border border-border min-w-[52px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{session.month}</span>
            <span className="text-xl font-extrabold leading-none tracking-tight">{session.day}</span>
          </div>
          
          <span className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            STATUS_CLASS[session.status],
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[session.status])} />
            {session.status}
          </span>
        </div>

        {/* Session Topic */}
        <h3 className="text-base font-bold leading-snug text-foreground group-hover:text-foreground/85 transition-colors duration-200 line-clamp-2">
          {session.topic}
        </h3>

        {/* Expert Profile */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30">
          <ExpertAvatar expert={session.expert} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-foreground">
              {session.expert.name}
            </p>
            <p className="truncate text-[11px] leading-snug text-muted-foreground mt-0.5">
              {session.expert.role}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Time, Price & CTA */}
      <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3.5 mt-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Starts at</span>
          <span className="flex items-center gap-1 text-xs text-foreground font-medium">
            <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5 text-muted-foreground" />
            {session.time}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center text-foreground mr-1">
            <FontAwesomeIcon icon={faIndianRupeeSign} className="h-3.5 w-3.5 text-foreground/80 mr-0.5" />
            <span className="text-lg font-extrabold leading-none">
              {session.price.toLocaleString("en-IN")}
            </span>
          </div>
          
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background transition-all duration-300 ease-in-out group-hover:w-[80px] group-hover:px-2">
            <span className="max-w-0 opacity-0 group-hover:max-w-[40px] group-hover:opacity-100 group-hover:mr-1 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-[10px] font-bold uppercase tracking-widest leading-none">
              Book
            </span>
            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function UpcomingSessions(): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filtered = activeFilter === "All"
    ? SESSIONS
    : SESSIONS.filter((s) => s.category === activeFilter);

  return (
    <section className="dark section-py relative bg-background overflow-hidden">
      
      {/* CSS Animations style block */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* Ambient Glow Effects */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[400px] w-[400px] rounded-full bg-foreground/2 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[400px] w-[400px] rounded-full bg-foreground/2 blur-[120px]" />

      <div className="page-container relative z-10">

        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Upcoming Sessions</p>
          </div>
          <h2 className="text-h1 text-balance text-foreground">
            Book your next{" "}
            <span>learning session</span>
          </h2>
          <p className="text-body mx-auto mt-4 max-w-sm">
            Expert-led 1:1 sessions happening this week. Learn from professionals through personalized guidance.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-10 flex flex-wrap justify-center gap-1.5 rounded-full border border-border/40 bg-muted/20 p-1.5 backdrop-blur-sm w-fit mx-auto">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={cn(
                "rounded-full px-5 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
                activeFilter === filter
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 min-h-[300px]">
          {filtered.slice(0, 3).map((session, index) => (
            <div
              key={session.id + "-" + activeFilter}
              className="animate-fade-up h-full"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <SessionCard session={session} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex justify-center">
          <Button size="lg" className="rounded-full px-8 font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg">
            Explore more sessions
            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 ml-2" />
          </Button>
        </div>

      </div>
    </section>
  );
}
