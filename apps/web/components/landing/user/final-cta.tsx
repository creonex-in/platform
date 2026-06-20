import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function FinalCta(): React.ReactElement {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-background py-24 md:py-32">
      {/* Subtle, highly engineered dotted grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:24px_24px] opacity-30 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)] dark:bg-[radial-gradient(#4b5563_1px,transparent_1px)] dark:opacity-20" />
      </div>
      <div className="page-container flex flex-col items-center text-center relative z-10">
        
        <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-foreground mb-6 text-balance leading-[1.15]">
          Ready to accelerate your career?
        </h2>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl font-normal leading-relaxed text-balance">
          Join thousands of ambitious learners upskilling with India's top 1% experts. 
          Book your first session today.
        </p>
        
        <Button 
          size="lg" 
          nativeButton={false}
          render={<Link href="/top-creators" />}
          className="group/button h-14 rounded-full px-10 text-base font-bold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg bg-foreground text-background hover:bg-foreground/90"
        >
          Explore Top Mentors
          <FontAwesomeIcon icon={faArrowRight} className="ml-3 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
        </Button>
        
      </div>
    </section>
  );
}