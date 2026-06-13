import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";

export default function CreatorFinalCta() {
  return (
    <section className="bg-background py-24 md:py-32 relative border-t border-border/40">
      
      {/* Very faint, elegant background glow - NOT a card, just ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-200 h-75 bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="page-container flex flex-col items-center text-center relative z-10">
        
        <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-foreground mb-6 text-balance leading-[1.15]">
          Ready to scale your business?
        </h2>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl font-normal leading-relaxed text-balance">
          Join thousands of top Indian creators who run their entire business on Creonex. No more duct-taping tools together.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
          <Button 
            size="lg" 
            className="w-full sm:w-auto rounded-full px-10 gap-2 font-medium bg-foreground text-background hover:bg-foreground/90 h-14 text-base shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            Get Started For Free <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto rounded-full px-10 gap-2 font-medium h-14 text-base transition-all bg-transparent border-border/60 hover:bg-muted"
          >
            Book a Demo
          </Button>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-3 text-sm text-muted-foreground font-medium">
          <span>No credit card required</span>
          <span className="w-1 h-1 rounded-full bg-border"></span>
          <span>14-day free trial</span>
        </div>
        
      </div>
    </section>
  );
}
