import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYoutube,
  faInstagram,
  faLinkedinIn,
  faXTwitter,
  faCcVisa,
  faCcMastercard,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

// ── Data ──────────────────────────────────────────────────────────────────────

const CREATOR_LINKS = [
  { label: "Become a Creator", href: "/creators" },
  { label: "Monetization", href: "/creators#monetize" },
  { label: "Payments Ecosystem", href: "/creators#payments" },
  { label: "Mobile App (Waitlist)", href: "/creators#app" },
];

const LEARNER_LINKS = [
  { label: "Find Top Mentors", href: "/mentors" },
  { label: "Browse Courses", href: "/courses" },
  { label: "1:1 Sessions", href: "/sessions" },
  { label: "Success Stories", href: "/#testimonials" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Cookie Policy", href: "/cookies" },
];

const SOCIAL_LINKS = [
  { icon: faYoutube, href: "#", label: "YouTube" },
  { icon: faInstagram, href: "#", label: "Instagram" },
  { icon: faLinkedinIn, href: "#", label: "LinkedIn" },
  { icon: faXTwitter, href: "#", label: "X / Twitter" },
  { icon: faEnvelope, href: "mailto:hello@creonex.in", label: "Email" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Footer(): React.ReactElement {
  return (
    <footer className="dark relative overflow-hidden bg-background">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-border" />

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="page-container pt-16 pb-10 md:pt-20">
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-12 xl:gap-x-16">

          {/* Brand column */}
          <div className="flex flex-col gap-6 sm:col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <Image
                src="/logo.webp"
                alt="Creonex"
                width={32}
                height={32}
                className="size-8 object-contain"
              />
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Creonex
              </span>
            </Link>

            <p className="text-body-sm leading-relaxed text-muted-foreground">
              Creonex is an all-in-one platform built for Indian micro-creators
              to sell courses, host sessions, and build thriving communities —
              from a single place.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  <FontAwesomeIcon icon={icon} className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* For Creators */}
          <div>
            <p className="text-label text-muted-foreground/50 mb-5 uppercase tracking-wider">For Creators</p>
            <ul className="space-y-3.5">
              {CREATOR_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-body-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Learners */}
          <div>
            <p className="text-label text-muted-foreground/50 mb-5 uppercase tracking-wider">For Learners</p>
            <ul className="space-y-3.5">
              {LEARNER_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-body-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="text-label text-muted-foreground/50 mb-5 uppercase tracking-wider">Company</p>
            <ul className="space-y-3.5">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-body-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <p className="text-label text-muted-foreground/50 mb-5 uppercase tracking-wider">Legal</p>
            <ul className="space-y-3.5">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-body-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Bottom Bar: Copyright & Payments ─────────────────────────────────── */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground/60">
            © {new Date().getFullYear()} Creonex Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-muted-foreground/50">
              100% Secure Payments
            </span>
            <div className="flex items-center gap-3 text-muted-foreground/40">
              <FontAwesomeIcon icon={faCcVisa} className="h-6 w-8" />
              <FontAwesomeIcon icon={faCcMastercard} className="h-6 w-8" />
              <div className="flex h-6 items-center rounded border border-white/10 px-2 text-[11px] font-bold tracking-wider">
                UPI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Watermark ─────────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden flex justify-center"
        style={{ height: "clamp(3.5rem, 15.4vw, 12.6rem)" }}
      >
        <p className="font-display font-bold leading-none tracking-tighter text-foreground/[0.085] whitespace-nowrap shrink-0"
          style={{ fontSize: "clamp(5rem, 22vw, 18rem)" }}>
          CREONEX
        </p>
      </div>

    </footer>
  );
}