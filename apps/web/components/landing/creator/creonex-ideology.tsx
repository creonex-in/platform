import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function CreonexIdeology(): React.ReactElement {
  return (
    <section className="section-py relative overflow-hidden">
      <div className="page-container">

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-label text-primary mb-5">Why Creonex</p>
          <h2 className="text-h1 text-foreground mb-6 text-balance tracking-wide">
            Where quality outranks follower count.
          </h2>
          <p className="text-body text-muted-foreground mb-8 text-balance leading-relaxed">
            Creonex ranks creators by how good they actually are — not by how many people follow them. Great teaching gets discovered on merit, so learners find the right mentor and creators grow on the value they deliver.
          </p>
          <Button size="lg" nativeButton={false} render={<Link href="#how-it-works" />}>
            See how it works
            <FontAwesomeIcon icon={faArrowRight} className="ml-2 transition-transform duration-300 group-hover/button:translate-x-1" />
          </Button>
        </div>

      </div>
    </section>
  );
}
