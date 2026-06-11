import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = {
  id: string;
  number: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  bgColorClass: string;
};

// ── Data ──────────────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    id: "niche",
    number: "01",
    title: "Define your niche",
    description: "Select your specific domain, list your core expertise, and set up your public profile in 2 minutes.",
    imageSrc: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Define your niche",
    bgColorClass: "bg-zinc-900/50 border-zinc-800/80 hover:border-primary/40",
  },
  {
    id: "offering",
    number: "02",
    title: "Publish offerings",
    description: "Launch comprehensive video courses, live bootcamps, or open 1-on-1 booking slots with custom rates.",
    imageSrc: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Publish offerings",
    bgColorClass: "bg-zinc-900/50 border-zinc-800/80 hover:border-purple-500/40",
  },
  {
    id: "split-payout",
    number: "03",
    title: "Collect payouts",
    description: "Share your page link. The system processes enrollments and routes earnings straight to your bank.",
    imageSrc: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Collect payouts",
    bgColorClass: "bg-zinc-900/50 border-zinc-800/80 hover:border-emerald-500/40",
  },
];

// ── Section ───────────────────────────────────────────────────────────────────

export default function HowItWorks(): React.ReactElement {
  return (
    <section id="how-it-works" className="bg-zinc-950 py-24 md:py-32 relative overflow-hidden border-t border-b border-zinc-900">

      {/* Decorative dark mode background glow blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="page-container relative z-10">

        {/* Header */}
        <div className="mx-auto mb-16 flex max-w-3xl flex-col items-center text-center md:mb-20">
          <p className="text-label text-primary mb-5">How it works</p>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[56px] lg:leading-[1.1] font-display">
            Simple steps to earning online.
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed font-light max-w-2xl mt-4 font-sans">
            No waiting, no manual payouts. Launch your offerings and start earning the same day.
          </p>
        </div>

        {/* Grid */}
        <div className="w-full grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 relative z-10">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`group relative flex w-full flex-col items-center overflow-hidden rounded-[2.5rem] px-6 py-12 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] sm:px-8 lg:py-14 border ${step.bgColorClass}`}
            >
              {/* Step Number Badge */}
              <span className="absolute top-6 left-6 text-xs font-bold text-zinc-400 font-mono bg-zinc-950/80 border border-zinc-800 px-3 py-1 rounded-full shadow-sm">
                Step {step.number}
              </span>

              {/* Floating Image Composition */}
              <div className="relative aspect-[4/3] w-full max-w-[280px] overflow-hidden rounded-[20px] shadow-md border border-zinc-800/60 transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg bg-zinc-950">
                <Image
                  src={step.imageSrc}
                  alt={step.imageAlt}
                  fill
                  className="object-cover transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* Text Content */}
              <div className="mt-10 flex flex-col items-center text-center">
                <h3 className="mb-3 text-2xl font-bold tracking-tight text-white lg:text-3xl font-display">
                  {step.title}
                </h3>
                <p className="max-w-[300px] text-sm font-light leading-relaxed text-zinc-400 font-sans">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
