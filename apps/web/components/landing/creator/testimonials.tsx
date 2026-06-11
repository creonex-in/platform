import TestimonialsDeck, { type Testimonial } from "@/components/landing/shared/testimonials-deck";

const CREATOR_TESTIMONIALS: Testimonial[] = [
  {
    id: "c1",
    name: "Priya Sharma",
    niche: "UI/UX Design",
    quote:
      "Creonex gave me a real home for my design courses. My first cohort sold out in two weeks — no paid ads, just organic discovery.",
    initials: "PS",
  },
  {
    id: "c2",
    name: "Arjun Mehta",
    niche: "Full-Stack Dev",
    quote:
      "I run live sessions every weekend. The scheduling and payments just work — I focus entirely on teaching, nothing else.",
    initials: "AM",
  },
  {
    id: "c3",
    name: "Kavya Nair",
    niche: "Content Strategy",
    quote:
      "First platform that pays Indian creators fairly. My community grew to 600 members in three months without any marketing budget.",
    initials: "KN",
  },
  {
    id: "c4",
    name: "Rohan Das",
    niche: "Motion Graphics",
    quote:
      "Uploaded my first course on Saturday, had my first sale by Sunday evening. The onboarding is genuinely that smooth.",
    initials: "RD",
  },
  {
    id: "c5",
    name: "Sneha Kapoor",
    niche: "Brand Identity",
    quote:
      "The profile page looks so professional that people trust it immediately. My session bookings doubled in the first month.",
    initials: "SK",
  },
];

export default function CreatorTestimonials(): React.ReactElement {
  return (
    <TestimonialsDeck
      testimonials={CREATOR_TESTIMONIALS}
      label="What creators say"
      heading={
        <>
          Real stories,{" "}
          <span className="text-muted-foreground">real creators.</span>
        </>
      }
      description="Over 2,400 creators across India use Creonex to sell their knowledge, earn consistently, and build businesses they actually own."
    />
  );
}
