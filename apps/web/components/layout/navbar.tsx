"use client";

import { JSX, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { parseRoles } from "@creonex/types";
import { UserMenu } from "@/components/layout/user-menu";
import { CreatorDashboardButton } from "@/components/layout/creator-dashboard-button";
import { LearnerDashboardButton } from "@/components/layout/learner-dashboard-button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCalendarCheck,
  faBook,
  faUsers,
  faBolt,
  faCirclePlay,
  faTag,
  faChartLine,
  faShieldHalved,
  faMagnifyingGlass,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import MobileNav from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type NavItem = {
  icon: IconDefinition;
  label: string;
  description: string;
  href: string;
};

type NavConfig = {
  megaLabel: string;
  megaLeft: { heading: string; items: NavItem[] };
  megaRight: { heading: string; items: NavItem[] };
  plainLinks: { label: string; href: string }[];
  ctaText: string;
  mobileLinks: { label: string; href: string }[];
};

// ── Per-route configs ─────────────────────────────────────────────────────────

const LEARNER_CONFIG: NavConfig = {
  megaLabel: "Explore",
  megaLeft: {
    heading: "Browse",
    items: [
      { icon: faCalendarCheck, label: "Sessions", description: "Book 1-on-1 time with verified experts", href: "#sessions" },
      { icon: faBook, label: "Courses", description: "Self-paced learning with lifetime access", href: "#courses" },
      { icon: faUsers, label: "Community", description: "Join expert-led paid communities", href: "#community" },
    ],
  },
  megaRight: {
    heading: "Discover",
    items: [
      { icon: faMagnifyingGlass, label: "Browse Topics", description: "Explore 1,800+ experts by category", href: "#explore" },
      { icon: faCirclePlay, label: "How It Works", description: "From search to skill in 3 steps", href: "#how-it-works" },
      { icon: faTag, label: "Pricing", description: "Transparent, no-surprise pricing", href: "#pricing" },
    ],
  },
  plainLinks: [
    { label: "For Creators", href: "/creators" },
    { label: "How It Works", href: "#how-it-works" },
  ],
  ctaText: "Get Started Free",
  mobileLinks: [
    { label: "Browse Topics", href: "#explore" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Creators", href: "/creators" },
  ],
};

const CREATOR_CONFIG: NavConfig = {
  megaLabel: "Features",
  megaLeft: {
    heading: "Earn",
    items: [
      { icon: faCalendarCheck, label: "Sessions", description: "Let learners book 1-on-1 time with you", href: "#sessions" },
      { icon: faBook, label: "Courses", description: "Record once, earn every week", href: "#courses" },
      { icon: faFileLines, label: "Digital Products", description: "Sell templates, guides, and resources", href: "#products" },
    ],
  },
  megaRight: {
    heading: "Platform",
    items: [
      { icon: faChartLine, label: "Analytics", description: "Track earnings and student growth", href: "#analytics" },
      { icon: faShieldHalved, label: "Payments", description: "UPI payouts, invoices, auto-settlements", href: "#payments" },
      { icon: faBolt, label: "How It Works", description: "Profile to first sale in minutes", href: "#how-it-works" },
    ],
  },
  plainLinks: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Learners", href: "/" },
  ],
  ctaText: "Start Teaching",
  mobileLinks: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Learners", href: "/" },
  ],
};

function getNavConfig(pathname: string, isCreator: boolean): NavConfig {
  if (pathname === "/creators") return CREATOR_CONFIG;
  if (isCreator) return CREATOR_CONFIG;
  return LEARNER_CONFIG;
}

function getLogoHref(isLoaded: boolean, isSignedIn: boolean, isCreator: boolean): string {
  if (!isLoaded || !isSignedIn) return "/";
  if (isCreator) return "/dashboard";
  return "/learner/dashboard";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MegaItem({ item }: { item: NavItem }): JSX.Element {
  return (
    <li>
      <Link
        href={item.href}
        className="group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-all duration-150 hover:bg-muted"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary transition-all duration-150 group-hover:border-primary/30 group-hover:bg-primary/5">
          <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{item.label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      </Link>
    </li>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Navbar(): JSX.Element {
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = !!session?.user;
  const isLoaded = !isPending;
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  const roles = session?.user?.role ? parseRoles(session.user.role) : [];
  const isCreator = roles.includes("creator");

  const config = getNavConfig(pathname, isLoaded && isCreator);
  const logoHref = getLogoHref(isLoaded, isSignedIn, isCreator);

  const mobileDashboardLink = isLoaded && isSignedIn
    ? isCreator
      ? { label: "Creator Dashboard", href: "/dashboard" }
      : { label: "My Learning", href: "/learner/dashboard" }
    : undefined;

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.setAttribute("data-scrolled", "");
      } else {
        header.removeAttribute("data-scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-transparent bg-transparent transition-all duration-300 data-[scrolled]:border-border data-[scrolled]:bg-background/80 data-[scrolled]:shadow-sm data-[scrolled]:backdrop-blur-md"
    >
      <nav className="page-container grid h-16 grid-cols-2 items-center gap-6 lg:grid-cols-3">

        {/* ── Col 1: Logo ─────────────────────────────────────────────────── */}
        <Link href={logoHref} className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.webp"
            alt=""
            width={32}
            height={32}
            className="size-8 object-contain"
            priority
          />
          <span className="text-[18px] font-bold tracking-tight text-foreground">
            Creonex
          </span>
        </Link>

        {/* ── Col 2: Nav links (desktop) ───────────────────────────────────── */}
        <div className="hidden place-self-center lg:flex">
          <NavigationMenu align="center">
            <NavigationMenuList className="gap-0.5">

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground data-open:bg-transparent data-popup-open:bg-transparent data-popup-open:text-foreground",
                  )}
                >
                  {config.megaLabel}
                </NavigationMenuTrigger>

                <NavigationMenuContent>
                  <div className="w-[600px] p-2">
                    <div className="mx-3 mb-2 h-0.5 w-10 rounded-full bg-primary" />
                    <div className="grid grid-cols-2">

                      <div className="p-3">
                        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
                          {config.megaLeft.heading}
                        </p>
                        <ul className="space-y-0.5">
                          {config.megaLeft.items.map((item) => (
                            <MegaItem key={item.label} item={item} />
                          ))}
                        </ul>
                      </div>

                      <div className="border-l border-border/60 p-3">
                        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
                          {config.megaRight.heading}
                        </p>
                        <ul className="space-y-0.5">
                          {config.megaRight.items.map((item) => (
                            <MegaItem key={item.label} item={item} />
                          ))}
                        </ul>
                      </div>

                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {config.plainLinks.map((link) => (
                <NavigationMenuItem key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent hover:bg-transparent",
                      pathname === link.href
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuItem>
              ))}

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* ── Col 3: Actions ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 justify-self-end">

          {/* Desktop */}
          <div className="hidden items-center gap-2 lg:flex">
            {isLoaded && !isSignedIn && (
              <>
                <Link href="/sign-in">
                  <Button className="cursor-pointer" variant="outline" size="lg">
                    Login
                  </Button>
                </Link>
                <Link href={pathname === '/creators' ? '/sign-up/creator' : '/sign-up/learner'}>
                  <Button className="cursor-pointer" variant="default" size="lg">
                    {config.ctaText}
                  </Button>
                </Link>
              </>
            )}
            {isLoaded && isSignedIn && (
              <div className="flex items-center gap-2">
                <LearnerDashboardButton />
                <CreatorDashboardButton />
                <UserMenu />
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-4 lg:hidden">
            {isLoaded && isSignedIn && <UserMenu />}
            <MobileNav
              links={config.mobileLinks}
              ctaText={config.ctaText}
              ctaHref={pathname === '/creators' ? '/sign-up/creator' : '/sign-up/learner'}
              dashboardLink={mobileDashboardLink}
            />
          </div>

        </div>

      </nav>
    </header>
  );
}
