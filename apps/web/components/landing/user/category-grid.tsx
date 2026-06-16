import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import CategoryCard, { type CategoryCardData } from "@/components/landing/shared/category-card";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES: CategoryCardData[] = [
  { id: "design", label: "UI/UX Design", experts: 240, courses: 38, imageSrc: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" },
  { id: "coding", label: "Coding", experts: 420, courses: 86, imageSrc: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=800&q=80" },
  { id: "finance", label: "Finance", experts: 310, courses: 52, imageSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" },
  { id: "career", label: "Career Growth", experts: 290, courses: 44, imageSrc: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" },
];

// ─── Section ──────────────────────────────────────────────────────────────────

export default function CategoryGrid(): React.ReactElement {
  return (
    <section id="explore" className="section-py bg-background">
      <div className="page-container">

        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-label mb-3 text-primary">Discover</p>
          <h2 className="text-h1 text-balance">
            Master any skill. <br />
            <span className="text-muted-foreground">Guided by the best.</span>
          </h2>
          <p className="text-body mx-auto mt-5 max-w-lg">
            Find the perfect mentor to accelerate your career in under 60 seconds.
          </p>
        </div>

        {/* Grid — 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <Button size="lg" className="h-14 rounded-full px-8 text-base font-bold shadow-lg transition-transform hover:-translate-y-0.5">
            <Link href="/top-creators">
              Explore all categories
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
