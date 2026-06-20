import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  niche: string;
  quote: string;
  avatarSrc?: string;
  initials?: string;
}

interface TestimonialsDeckProps {
  heading: React.ReactNode;
  label?: string; // maps to label/subheading
  description?: string;
  testimonials: Testimonial[];
}

export default function TestimonialsDeck({
  heading,
  label = "TESTIMONIALS",
  description,
  testimonials
}: TestimonialsDeckProps): React.ReactElement {
  return (
    <section className="bg-background pt-16 md:pt-24 pb-10 md:pb-16 border-t border-border/10">
      <div className="page-container">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-16 flex flex-col items-center text-center">
            <p className="text-label text-primary mb-5">
              {label}
            </p>
            <h2 className="text-h1 text-balance">
              {heading}
            </h2>
            {description && (
              <p className="text-body mt-5 max-w-xl text-balance">
                {description}
              </p>
            )}
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">

            {testimonials.map((t) => (
              <div key={t.id} className="mb-6 break-inside-avoid rounded-xl border border-border/50 bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
                <p className="text-body">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="mt-8 flex items-center gap-4">
                  {t.avatarSrc ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted border border-border/50 shrink-0">
                      <Image src={t.avatarSrc} alt={t.name} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-foreground flex items-center justify-center text-[12px] font-bold text-background shrink-0">
                      {t.initials || t.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-body-sm">{t.niche}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* "You?" Card */}
            <div className="mb-6 flex min-h-[200px] break-inside-avoid flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-transparent p-8 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:bg-accent/30 cursor-pointer group">
              <span className="text-3xl font-light text-muted-foreground/60 group-hover:text-primary transition-colors duration-300">+</span>
              <span className="mt-2 text-sm font-medium group-hover:text-primary transition-colors duration-300">you?</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
