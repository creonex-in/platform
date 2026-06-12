"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faRotateLeft,
  faBolt,
  faLock,
  faWallet,
  faBuildingColumns,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Pillar = {
  id: string;
  title: string;
  body: string;
  badge: string;
};

const PILLARS: readonly Pillar[] = [
  {
    id: "secure",
    title: "Secure checkout",
    body: "Every payment is Razorpay-powered and SSL encrypted. Your card data never touches our servers.",
    badge: "PCI DSS compliant",
  },
  {
    id: "refund",
    title: "Guaranteed refund",
    body: "Session didn't happen? Not satisfied? You get 100% back. No forms, no waiting, no questions.",
    badge: "7-day refund window",
  },
  {
    id: "payouts",
    title: "Fast creator payouts",
    body: "Creators receive settlements within 48 hours of a completed session, directly to their bank account.",
    badge: "Direct bank transfer",
  },
] as const;

// ── Visual Headers ────────────────────────────────────────────────────────────

function SecureCheckoutVisual(): React.ReactElement {
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-pink-500/10 via-purple-600/15 to-violet-500/10 border border-border/45">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold text-foreground shadow-sm border border-border/60">
        <span>✦</span>
        <span>PCI DSS compliant</span>
      </div>
      
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-border/40">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-lg border border-border/50">
          <FontAwesomeIcon icon={faShieldHalved} className="h-6 w-6 text-purple-600" />
        </div>
        
        <div className="absolute -left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1F71] text-[8px] font-extrabold italic text-white shadow-md border border-white/10">
          VISA
        </div>
        
        <div className="absolute -right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#097939] text-[7px] font-black text-white shadow-md border border-white/10">
          UPI
        </div>

        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-card text-foreground shadow-md border border-border/50">
          <FontAwesomeIcon icon={faWallet} className="h-3.5 w-3.5 text-amber-500" />
        </div>
      </div>
    </div>
  );
}

function RefundVisual(): React.ReactElement {
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-amber-500/10 via-orange-600/15 to-pink-500/10 border border-border/45">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold text-foreground shadow-sm border border-border/60">
        <span>✦</span>
        <span>7-day refund window</span>
      </div>

      <div className="w-[180px] rounded-xl bg-card p-3.5 border border-border/50 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Refund Request</span>
          </div>
          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Approved</span>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-extrabold text-foreground">₹1,299.00</span>
            <span className="text-[8px] text-muted-foreground">100% Back</span>
          </div>
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" />
          </div>
          <div className="flex items-center justify-between text-[8px] text-muted-foreground pt-0.5">
            <span>Status: Transferred</span>
            <span>0 questions asked</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayoutsVisual(): React.ReactElement {
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-violet-600/15 via-indigo-600/15 to-purple-500/10 border border-border/45">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold text-foreground shadow-sm border border-border/60">
        <span>✦</span>
        <span>Direct bank transfer</span>
      </div>

      <div className="w-[180px] rounded-xl bg-card p-3.5 border border-border/50 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative h-7 w-7 rounded-full bg-muted border border-border/50 flex items-center justify-center text-[9px] font-bold text-foreground">
            SJ
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold leading-none text-foreground">Sarah Johnson</p>
            <p className="text-[7px] leading-none text-muted-foreground mt-1">Creator Account</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/40 p-2 border border-border/20">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[8px] font-medium text-muted-foreground">Session Earnings</span>
            <span className="text-[9px] font-extrabold text-emerald-500">+₹999.00</span>
          </div>
          <div className="flex justify-between items-center text-[7px] text-muted-foreground">
            <span>Payout Time</span>
            <span className="font-medium text-foreground">Instant (48 hrs)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Payment brand badges ───────────────────────────────────────────────────────

function UPIBadge(): React.ReactElement {
  return (
    <div className="flex h-7 items-center gap-1 rounded-md bg-[#097939] px-2.5">
      <span className="font-display text-[10px] font-black tracking-[0.12em] text-white">UPI</span>
    </div>
  );
}

function VisaBadge(): React.ReactElement {
  return (
    <div className="flex h-7 items-center rounded-md bg-[#1A1F71] px-3">
      <span className="font-display text-[11px] font-black italic tracking-wider text-white">VISA</span>
    </div>
  );
}

function MastercardBadge(): React.ReactElement {
  return (
    <div className="flex h-7 w-12 items-center justify-center rounded-md border border-border bg-card">
      <div className="flex">
        <div className="h-4.5 w-4.5 rounded-full bg-[#EB001B]" />
        <div className="-ml-2 h-4.5 w-4.5 rounded-full bg-[#FF5F00] mix-blend-multiply" />
      </div>
    </div>
  );
}

function RuPayBadge(): React.ReactElement {
  return (
    <div className="flex h-7 items-center gap-0.5 rounded-md bg-[#003399] px-2">
      <span className="font-display text-[10px] font-black tracking-wide text-white">Ru</span>
      <span className="font-display text-[10px] font-black tracking-wide text-[#FF6B00]">Pay</span>
    </div>
  );
}

function NetBankingBadge(): React.ReactElement {
  return (
    <div className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5">
      <FontAwesomeIcon icon={faBuildingColumns} className="h-3 w-3 text-muted-foreground" />
      <span className="text-[9px] font-semibold tracking-wide text-muted-foreground">Net Banking</span>
    </div>
  );
}

function WalletsBadge(): React.ReactElement {
  return (
    <div className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5">
      <FontAwesomeIcon icon={faWallet} className="h-3 w-3 text-muted-foreground" />
      <span className="text-[9px] font-semibold tracking-wide text-muted-foreground">Wallets</span>
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
  return (
    <section className="bg-background section-py relative overflow-hidden border-t border-border/40">
      <div className="page-container relative z-10">

        {/* Header */}
        <div className="mx-auto mb-14 max-w-xl text-center">
          <p className="text-label mb-3 text-primary">Payments &amp; Trust</p>
          <h2 className="text-h1 text-balance text-foreground">
            Your money is <span className="text-muted-foreground">always protected.</span>
          </h2>
          <p className="text-body mx-auto mt-4 max-w-sm">
            Secure checkout for learners. Reliable settlements for creators.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Card 1 */}
          <div className="flex flex-col gap-5 rounded-2xl bg-card/45 p-5 border border-border/60 shadow-sm transition-all duration-300 hover:shadow-md hover:border-foreground/20">
            <SecureCheckoutVisual />
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-h4 text-foreground font-bold">{PILLARS[0].title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{PILLARS[0].body}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col gap-5 rounded-2xl bg-card/45 p-5 border border-border/60 shadow-sm transition-all duration-300 hover:shadow-md hover:border-foreground/20">
            <RefundVisual />
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-h4 text-foreground font-bold">{PILLARS[1].title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{PILLARS[1].body}</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col gap-5 rounded-2xl bg-card/45 p-5 border border-border/60 shadow-sm transition-all duration-300 hover:shadow-md hover:border-foreground/20">
            <PayoutsVisual />
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-h4 text-foreground font-bold">{PILLARS[2].title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{PILLARS[2].body}</p>
            </div>
          </div>
        </div>

        {/* Payment methods strip */}
        <div className="mt-8 rounded-2xl bg-card/45 p-5 border border-border/50">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground/60">
              <FontAwesomeIcon icon={faLock} className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Accepted</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex flex-wrap items-center gap-2">
              {PAYMENT_BADGES}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
