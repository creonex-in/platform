import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faWallet, faReceipt } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type Pillar = {
  id: string;
  title: string;
  body: string;
  icon: IconDefinition;
  cardBg: string;
  iconColor: string;
};

const PILLARS: readonly Pillar[] = [
  {
    id: "upi",
    title: "UPI Intent",
    body: "Native GPay & PhonePe checkout in a single tap.",
    icon: faBolt,
    cardBg: "bg-violet-100/70 dark:bg-violet-500/10 border-violet-200/70 dark:border-violet-500/20",
    iconColor: "text-violet-600 dark:text-violet-300",
  },
  {
    id: "payouts",
    title: "Weekly Payouts",
    body: "Settled automatically to your bank every Monday.",
    icon: faWallet,
    cardBg: "bg-emerald-100/70 dark:bg-emerald-500/10 border-emerald-200/70 dark:border-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-300",
  },
  {
    id: "invoices",
    title: "Auto Invoices",
    body: "100% automated, GST-compliant billing.",
    icon: faReceipt,
    cardBg: "bg-amber-100/70 dark:bg-amber-500/10 border-amber-200/70 dark:border-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-300",
  },
] as const;

export default function IndiaFirstPayments(): React.ReactElement {
  return (
    <section id="payments" className="bg-background py-12 md:py-16 relative z-10">
      <div className="page-container">
        <div className="rounded-[2.5rem] border border-border/50 bg-card p-8 md:p-12 shadow-sm relative overflow-hidden">

          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 relative z-10 items-center">

            {/* Left Side: Header */}
            <div className="lg:col-span-4 text-center lg:text-left">
              <p className="text-label text-primary mb-5">India-First Payments</p>
              <h3 className="text-h2 text-foreground mb-4">
                Every way Indians pay.
              </h3>
              <p className="text-body">
                Zero friction checkout for your buyers. Predictable, secure weekly payouts for you.
              </p>
            </div>

            {/* Right Side: Feature Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {PILLARS.map((pillar) => (
                <div
                  key={pillar.id}
                  className={`flex flex-col gap-5 rounded-3xl p-6 border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${pillar.cardBg}`}
                >
                  <div className="h-11 w-11 rounded-2xl bg-white/70 dark:bg-white/10 flex items-center justify-center shadow-sm">
                    <FontAwesomeIcon icon={pillar.icon} className={`h-5 w-5 ${pillar.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="text-h4 text-foreground font-bold mb-1.5">{pillar.title}</h4>
                    <p className="text-body-sm">{pillar.body}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
