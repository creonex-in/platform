import type { Metadata } from "next";
import HeroSection from "@/components/landing/creator/hero-section";
import CreonexIdeology from "@/components/landing/creator/creonex-ideology";
import FeaturedCreators from "@/components/landing/creator/featured-creators";
import CreatorTimeline from "@/components/landing/creator/creator-timeline";
import HowItWorks from "@/components/landing/creator/how-it-works";
import MonetizeSection from "@/components/landing/creator/monetize-section";
import Faqs from "@/components/landing/shared/faqs";
import Testimonials from "@/components/landing/creator/testimonials";
import CollaborationMarketplace from "@/components/landing/creator/collaboration-marketplace";
import IndiaFirstPayments from "@/components/landing/creator/india-first-payments";
import MobileAppSection from "@/components/landing/creator/mobile-app-section";

export const metadata: Metadata = {
  title: "For Creators — Creonex",
  description:
    "Sell courses, host sessions, and build your community. One platform built for micro-creators across India.",
};

export default function CreatorLandingPage(): React.ReactElement {
  return (
          <main className="theme-creator">
        <HeroSection />
        <CreonexIdeology />
        <FeaturedCreators />
        <MonetizeSection />
        <CollaborationMarketplace />
        <CreatorTimeline />
        <IndiaFirstPayments />
        <HowItWorks />
        <MobileAppSection />
        <Testimonials />
        <Faqs />
      </main>
      );
}

