import TestimonialsDeck, { type Testimonial } from "@/components/landing/shared/testimonials-deck";

const USER_TESTIMONIALS: Testimonial[] = [
  {
    id: "u1",
    name: "Ananya Joshi",
    niche: "Aspiring Product Designer",
    quote: "Booked a portfolio review session and got an offer at a product startup the very next week. Worth every rupee.",
    initials: "AJ",
  },
  {
    id: "u2",
    name: "Karan Bhatia",
    niche: "Software Engineer",
    quote: "Cracked my system design round after two 1:1 sessions. The expert explained things my college never did in four years.",
    initials: "KB",
  },
  {
    id: "u3",
    name: "Meghna Pillai",
    niche: "Marketing Professional",
    quote: "I went from zero to running my own freelance campaigns. The personal branding course was exactly what I needed.",
    initials: "MP",
  },
  {
    id: "u4",
    name: "Sahil Gupta",
    niche: "Computer Science Student",
    quote: "The React course was more useful than my entire semester. Practical, fast, and the mentor actually responds to questions.",
    initials: "SG",
  },
  {
    id: "u5",
    name: "Riya Malhotra",
    niche: "Finance Analyst",
    quote: "Booked a career growth session and completely changed my trajectory. Three months later I switched jobs and got a 40% hike.",
    initials: "RM",
  },
];

export default function UserTestimonials(): React.ReactElement {
  return (
    <TestimonialsDeck
      testimonials={USER_TESTIMONIALS}
      label="What learners say"
      heading={
        <>
          Real results,{" "}
          <span className="text-muted-foreground">real learners.</span>
        </>
      }
      description="Thousands of learners across India use Creonex to upskill, switch careers, and grow — guided by experts who've been there."
    />
  );
}
