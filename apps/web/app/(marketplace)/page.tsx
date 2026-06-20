import type { Metadata } from "next";
import { getMe } from "@/dal/users.dal";
import UserHero from "@/components/landing/user/user-hero";
import StatsSection from "@/components/landing/user/stats-section";
import WhyLearnersChoose from "@/components/landing/user/why-learners-choose";
import CategoryGrid from "@/components/landing/user/category-grid";
import HowItWorks from "@/components/landing/user/how-it-works";
import CinematicGallery from "@/components/landing/shared/creators-gallery";
import PaymentsTrust from "@/components/landing/user/payments-trust";
import Testimonials from "@/components/landing/user/testimonials";
import Faqs from "@/components/landing/shared/faqs";
import FinalCta from "@/components/landing/user/final-cta";
export const metadata: Metadata = {
  title: "Creonex — Learn from India's Best Creators",
  description:
    "Discover courses and book 1-on-1 mentorship sessions with verified experts across design, tech, marketing, and more.",
};

import { LearnerDashboard } from "@/components/learner/learner-dashboard";

export default async function LearnerLandingPage(): Promise<React.ReactElement> {

  try {
    const user = await getMe();
    if (user) {
      // const roles = parseRoles(user.role);
      // if (roles.includes("creator")) {
      //   redirect("/creator");
      // }
      return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <main className="flex-1 pb-24 md:pb-0">
            <LearnerDashboard />
          </main>
        </div>
      );
    }

    return (
      <main>
        <UserHero />
        <StatsSection />
        <CategoryGrid />
        <CinematicGallery />
        <WhyLearnersChoose />
        <PaymentsTrust />
        <HowItWorks />
        <Testimonials />
        <Faqs />
        <FinalCta />
      </main>
    );
  } catch (error) {
    return <></>
  }
}

