"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faRotateLeft,
  faBolt,
  faLock,
  faBuildingColumns,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ── Data ──────────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    id: "secure",
    icon: faShieldHalved,
    title: "Secure checkout",
    body: "Every payment is Razorpay-powered and SSL encrypted. Your card data never touches our servers.",
    badge: "PCI DSS compliant",
  },
  {
    id: "refund",
    icon: faRotateLeft,
    title: "Guaranteed refund",
    body: "Session didn't happen? Not satisfied? You get 100% back. No forms, no waiting, no questions.",
    badge: "7-day refund window",
  },
  {
    id: "payouts",
    icon: faBolt,
    title: "Fast creator payouts",
    body: "Creators receive settlements within 48 hours of a completed session, directly to their bank account.",
    badge: "Direct bank transfer",
  },
] as const;

// ── Payment brand badges ───────────────────────────────────────────────────────

function UPIBadge(): React.ReactElement {
  return (
    <div className="flex h-8 items-center gap-1 rounded-md bg-[#097939] px-2.5">
      <span className="font-display text-[11px] font-black tracking-[0.12em] text-white">UPI</span>
    </div>
  );
}

function VisaBadge(): React.ReactElement {
  return (
    <div className="flex h-8 items-center rounded-md bg-[#1A1F71] px-3">
      <span className="font-display text-[13px] font-black italic tracking-wider text-white">VISA</span>
    </div>
  );
}

function MastercardBadge(): React.ReactElement {
  return (
    <div className="flex h-8 w-14 items-center justify-center rounded-md border border-border bg-white">
      <div className="flex">
        <div className="h-5 w-5 rounded-full bg-[#EB001B]" />
        <div className="-ml-2.5 h-5 w-5 rounded-full bg-[#FF5F00] mix-blend-multiply" />
      </div>
    </div>
  );
}

function RuPayBadge(): React.ReactElement {
  return (
    <div className="flex h-8 items-center gap-0.5 rounded-md bg-[#003399] px-2.5">
      <span className="font-display text-[11px] font-black tracking-wide text-white">Ru</span>
      <span className="font-display text-[11px] font-black tracking-wide text-[#FF6B00]">Pay</span>
    </div>
  );
}

function NetBankingBadge(): React.ReactElement {
  return (
    <div className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5">
      <FontAwesomeIcon icon={faBuildingColumns} className="h-3 w-3 text-muted-foreground" />
      <span className="text-[10px] font-semibold tracking-wide text-muted-foreground">Net Banking</span>
    </div>
  );
}

function WalletsBadge(): React.ReactElement {
  return (
    <div className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5">
      <FontAwesomeIcon icon={faWallet} className="h-3 w-3 text-muted-foreground" />
      <span className="text-[10px] font-semibold tracking-wide text-muted-foreground">Wallets</span>
    </div>
  );
}

const PAYMENT_BADGES = [
  <UPIBadge key="upi" />,
  <VisaBadge key="visa" />,
  <MastercardBadge key="mc" />,
  <RuPayBadge key="rupay" />,
  <NetBankingBadge key="nb" />,
  <WalletsBadge key="wallets" />,
];

// ── Section ───────────────────────────────────────────────────────────────────

export default function PaymentsTrust(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(".pt-animate",
        { opacity: 0, y: 22 },
        {
          opacity: 1, y: 0,
          duration: 0.75,
          stagger: 0.09,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 76%",
            once: true,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="section-py border-t border-border bg-background">
      <div className="page-container">

        <div className="pt-animate mx-auto mb-14 max-w-xl text-center">
          <p className="text-label mb-3 text-primary">Payments &amp; Trust</p>
          <h2 className="text-h1 text-balance text-foreground">
            Your money is{" "}
            <span className="text-primary">always protected.</span>
          </h2>
          <p className="text-body mx-auto mt-4 max-w-sm text-muted-foreground">
            Secure checkout for learners. Reliable settlements for creators.
          </p>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="pt-animate group flex flex-col gap-5 bg-background p-8 transition-colors duration-300 hover:bg-card md:p-10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-300 group-hover:bg-primary/15">
                <FontAwesomeIcon icon={pillar.icon} className="h-4 w-4 text-primary" />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-h4 text-foreground">{pillar.title}</h3>
                <p className="text-body-sm text-muted-foreground">{pillar.body}</p>
              </div>

              <span className="text-label text-primary/60">{pillar.badge}</span>
            </div>
          ))}
        </div>

        <div className="pt-animate mt-px bg-card px-8 py-5 md:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground/50">
              <FontAwesomeIcon icon={faLock} className="h-3 w-3" />
              <span className="text-label">Accepted</span>
            </div>
            <div className="h-4 w-px bg-border" />
            {PAYMENT_BADGES}
          </div>
        </div>

      </div>
    </section>
  );
}
