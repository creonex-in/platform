import type { Metadata } from "next";
import MarketingShell from "@/components/layout/marketing-shell";
import UserHero from "@/components/landing/user/user-hero";
import StatsSection from "@/components/landing/user/stats-section";
import WhyLearnersChoose from "@/components/landing/user/why-learners-choose";
import CategoryGrid from "@/components/landing/user/category-grid";
import LearningShowcase from "@/components/landing/user/learning-showcase";
import HowItWorks from "@/components/landing/user/how-it-works";
import CinematicGallery from "@/components/landing/shared/creators-gallery";
import UpcomingSessions from "@/components/landing/user/upcoming-sessions";
import PaymentsTrust from "@/components/landing/user/payments-trust";
import Testimonials from "@/components/landing/user/testimonials";
import Faqs from "@/components/landing/shared/faqs";
import FinalCta from "@/components/landing/user/final-cta";
import CreatorRoutingBanner from "@/components/landing/user/creator-routing-banner";

export const metadata: Metadata = {
  title: "Creonex — Learn from India's Best Creators",
  description:
    "Discover courses and book 1-on-1 mentorship sessions with verified experts across design, tech, marketing, and more.",
};

export default function LearnerLandingPage(): React.ReactElement {
  return (
    <MarketingShell>
      <main>
        <CreatorRoutingBanner />
        <UserHero />
        <StatsSection />
        <WhyLearnersChoose />
        <CategoryGrid />
        <CinematicGallery />
        <LearningShowcase />
        <HowItWorks />
        {/* <UpcomingSessions /> */}
        <PaymentsTrust />
        <Testimonials />
        <Faqs />
        <FinalCta />
      </main>
    </MarketingShell>
  );
}
