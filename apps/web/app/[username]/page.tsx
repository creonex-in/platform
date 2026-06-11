import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faStar, faBolt, faHeart, faEye, faCircleCheck,
  faUserPlus, faCalendarCheck, faUsers,
  faCode, faMicrophone, faPen, faBriefcase,
  faLocationDot, faClock, faQuoteLeft, faArrowRight, faTrophy, faShareNodes,
} from '@fortawesome/free-solid-svg-icons'
import { faTwitter, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BadgesButton } from './_components/badges-button'
import { BookSessionBar } from './_components/book-session-bar'
import { ThemeToggle } from '@/components/theme-toggle'
import Faqs from '@/components/landing/shared/faqs'
import UserTestimonials from '@/components/landing/user/testimonials'
import { CreatorTabs } from './_components/creator-tabs'

// ─── Data ─────────────────────────────────────────────────────────────────────

const creator = {
  name: 'Arjun Sharma',
  bio: 'Design Career Coach · UI/UX Lead at Razorpay',
  bioLong: [
    "I've been a Design Lead for 7 years, interviewed 200+ candidates, and reviewed 500+ portfolios. I've hired designers at three startups and know exactly what separates callbacks from rejections.",
    "My students have landed roles at Razorpay, Zepto, Swiggy, CRED, and more — most with zero prior design background. I teach only what gets people hired. Nothing else.",
  ],
  location: 'Bengaluru, India',
  avatar: '/images/experts/expert-1.png',
  rating: 4.9,
  reviewCount: 127,
  students: 847,
  sessions: 312,
  yearsExp: 7,
  brandColorLight: '#ede9fe',
  skills: [
    { label: 'UI/UX Design', icon: faPen as IconDefinition },
    { label: 'Career Coaching', icon: faBriefcase as IconDefinition },
    { label: 'Figma & Design Systems', icon: faCode as IconDefinition },
    { label: 'Team Management', icon: faUsers as IconDefinition },
    { label: 'Public Speaking', icon: faMicrophone as IconDefinition },
  ],
}

const companies = ['Zepto', 'Swiggy', 'Razorpay', 'CRED', 'Meesho', 'PhonePe']

// ─── Offering cards ───────────────────────────────────────────────────────────

type BadgeVariant = 'urgency' | 'open' | 'new' | 'promo'
interface OfferingCard {
  id: string; title: string; category: string; image: string
  price: number; rating: number; likes: number; views: string
  badge?: string; badgeVariant?: BadgeVariant
}
const badgeStyles: Record<BadgeVariant, string> = {
  urgency: 'bg-red-500 text-white',
  open: 'bg-emerald-500 text-white',
  new: 'bg-blue-500 text-white',
  promo: 'bg-amber-500 text-white',
}

const courses: OfferingCard[] = [
  { id: 'course-1', title: 'Figma for Complete Beginners', category: 'UI Design', image: '/showcase/course-preview.png', price: 1299, rating: 4.9, likes: 517, views: '12.4k', badge: 'Bestseller', badgeVariant: 'promo' },
  { id: 'course-2', title: 'Think Like a Product Designer', category: 'Product Thinking', image: '/creator-profiles/create-course.png', price: 1799, rating: 4.8, likes: 389, views: '8.9k', badge: 'New', badgeVariant: 'new' },
  { id: 'course-3', title: 'Design Systems That Scale', category: 'Advanced Design', image: '/showcase/start-teaching-today.png', price: 2499, rating: 5.0, likes: 875, views: '5.2k' },
  { id: 'course-4', title: 'Portfolio That Gets Callbacks', category: 'Career', image: '/creator-profiles/second-section-image.png', price: 999, rating: 4.9, likes: 623, views: '9.1k', badge: 'Hot', badgeVariant: 'promo' },
  { id: 'course-5', title: 'Freelance UI Design in 30 Days', category: 'Freelancing', image: '/categories/category-1.png', price: 1499, rating: 4.7, likes: 445, views: '6.3k' },
  { id: 'course-6', title: 'UX Research for Beginners', category: 'UX Research', image: '/categories/category-2.jpeg', price: 1199, rating: 4.8, likes: 312, views: '4.7k' },
]
const sessions: OfferingCard[] = [
  { id: 'session-1', title: 'Portfolio & Career Review', category: '1:1 Call · 60 min', image: '/showcase/expert-session.png', price: 2500, rating: 4.9, likes: 248, views: '89 booked', badge: '3 slots left', badgeVariant: 'urgency' },
  { id: 'session-2', title: 'Design Career Accelerator', category: '4-Week Program', image: '/creator-profiles/sessions.png', price: 8000, rating: 5.0, likes: 134, views: '34 booked', badge: '1 spot left', badgeVariant: 'urgency' },
  { id: 'session-3', title: 'Figma Crash Course Call', category: '1:1 Call · 30 min', image: '/creator-profiles/himesh.jpeg', price: 1200, rating: 4.8, likes: 192, views: '52 booked' },
]
const groups: OfferingCard[] = [
  { id: 'group-1', title: 'Design Job Hunters', category: 'Community · Monthly', image: '/creator-profiles/join-community.png', price: 499, rating: 4.9, likes: 312, views: '48 members', badge: 'Open', badgeVariant: 'open' },
  { id: 'group-2', title: 'Senior Designer Mastermind', category: 'Community · Monthly', image: '/showcase/resources-library.png', price: 999, rating: 5.0, likes: 198, views: '22 members', badge: '3 spots left', badgeVariant: 'urgency' },
  { id: 'group-3', title: 'Weekly Portfolio Clinic', category: 'Group · Weekly', image: '/categories/category-3.jpg', price: 299, rating: 4.8, likes: 245, views: '31 members', badge: 'Open', badgeVariant: 'open' },
]


// ─── Reviews ──────────────────────────────────────────────────────────────────

interface Review {
  id: string; name: string; initials: string
  role: string; before: string; after: string
  rating: number; text: string
}
const reviews: Review[] = [
  { id: '1', name: 'Priya Nair', initials: 'PN', role: 'Product Designer at Zepto', before: 'Marketing Executive', after: '₹18L/year', rating: 5, text: 'I had zero design background. Arjun told me exactly what to fix. Got my first offer 6 weeks after our session.' },
  { id: '2', name: 'Karan Mehta', initials: 'KM', role: 'Freelance UI Designer', before: 'IT Support Engineer', after: '₹90K/month', rating: 5, text: 'No padding, no filler — just the stuff that actually matters. Quit my old job 3 months later.' },
  { id: '3', name: 'Ananya Reddy', initials: 'AR', role: 'Senior UX at PhonePe', before: 'Graphic Designer', after: '₹24L/year', rating: 5, text: "I'd been stuck at the same salary for 3 years. One portfolio audit session and I had 2 competing offers." },
  { id: '4', name: 'Vikram Singh', initials: 'VS', role: 'UI Lead at Meesho', before: 'Web Developer', after: '₹28L/year', rating: 5, text: 'The career roadmap Arjun gave me was worth 10x the session price. Absolute clarity on what to do next.' },
]

// ─── FAQs ─────────────────────────────────────────────────────────────────────

const faqs: { q: string; a: string }[] = [
  { q: 'What happens in a 1:1 session?', a: 'We meet on Google Meet for 30 or 60 minutes. I review your portfolio, give you a prioritised list of changes, and answer career questions. You leave with a clear action plan.' },
  { q: 'How do I book and pay?', a: "Click Book Now, pick a slot, pay via UPI, card, or net banking. You'll get a calendar invite instantly." },
  { q: 'Can I reschedule?', a: 'Yes — up to 24 hours before the session, at no charge. Use the link in your confirmation email.' },
  { q: 'Do I need prior design experience?', a: "No. Most students started with zero design background. The only requirement is that you're serious about a career switch." },
  { q: 'Will I get a certificate?', a: "Course enrollments include a completion certificate. 1:1 sessions don't — but the portfolio you build will speak louder." },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreatorProfilePage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* ══════════ 1. HERO ══════════ */}
      <div className="w-full h-[160px] sm:h-[220px] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 40%, #ddd6fe 70%, #c7d2fe 100%)' }}>
        <div className="absolute top-1/2 left-[32%] -translate-x-1/2 -translate-y-1/2 w-[260px] h-[160px] rounded-full bg-violet-500/30 blur-[40px]" />
        <div className="absolute top-1/2 left-[22%] -translate-x-1/2 -translate-y-1/2 w-[180px] h-[120px] rounded-full bg-indigo-500/30 blur-[30px]" />
      </div>

      <div className="page-container mx-auto relative">
        {/* Profile Header */}
        <div className="px-5 sm:px-10 pb-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-[48px] sm:-mt-[64px] relative z-10 gap-6 md:gap-0">

            {/* Left side (Avatar + Info) */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-7">
              <div className="w-[130px] h-[130px] sm:w-[190px] sm:h-[190px] rounded-[32px] sm:rounded-[40px] border-[6px] sm:border-[8px] border-background shadow-sm bg-muted overflow-hidden shrink-0 relative">
                <Image src={creator.avatar} alt={creator.name} fill className="object-cover" />
              </div>

              <div className="pb-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-1.5 mt-2 sm:mt-0">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-[24px] sm:text-[28px] font-extrabold text-foreground tracking-tight leading-none">{creator.name}</h1>
                    <span className="bg-foreground text-background text-[10px] font-bold px-2 py-[3px] rounded-[6px] flex items-center gap-1 shrink-0 mt-0.5">
                      PRO <FontAwesomeIcon icon={faBolt} className="size-[9px] text-amber-400" />
                    </span>
                  </div>
                  <Button variant="outline" size="icon" className="hidden sm:flex w-8 h-8 rounded-full border-border text-muted-foreground hover:bg-muted hover:text-foreground">
                    <FontAwesomeIcon icon={faShareNodes} className="size-4" />
                  </Button>
                </div>
                <p className="text-[14px] sm:text-[15px] text-muted-foreground leading-snug mb-3 font-medium max-w-lg">
                  {creator.bio} <br className="hidden sm:block" />
                  based in {creator.location}
                </p>

                <div className="flex items-center gap-3.5 mb-5">
                  <a href="#" className="text-muted-foreground/80 hover:text-[#1DA1F2] transition-colors"><FontAwesomeIcon icon={faTwitter} className="size-4 sm:size-5" /></a>
                  <a href="#" className="text-muted-foreground/80 hover:text-[#0A66C2] transition-colors"><FontAwesomeIcon icon={faLinkedin} className="size-4 sm:size-5" /></a>
                  <a href="#" className="text-muted-foreground/80 hover:text-[#FF0000] transition-colors"><FontAwesomeIcon icon={faYoutube} className="size-4 sm:size-5" /></a>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button className="rounded-full px-8 text-[13px] font-semibold flex-1 sm:flex-none">
                    Follow
                  </Button>
                  <Button variant="outline" className="rounded-full px-8 text-[13px] font-semibold flex-1 sm:flex-none border-border">
                    Book Session
                  </Button>
                  <Button variant="outline" size="icon" className="sm:hidden rounded-full shrink-0 border-border text-muted-foreground hover:bg-muted hover:text-foreground">
                    <FontAwesomeIcon icon={faShareNodes} className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right side (Badges & Stats) */}
            <div className="flex flex-col md:items-end gap-6 md:pb-2 pt-4 md:pt-0 w-full md:w-auto">
              <div className="flex flex-col md:items-end w-full">
                <BadgesButton />
              </div>

              <div className="flex items-center gap-6 sm:gap-8 md:gap-10">
                <div className="text-left md:text-center">
                  <p className="text-[12px] text-muted-foreground font-bold mb-1">Students</p>
                  <p className="text-[20px] sm:text-[24px] font-extrabold text-foreground leading-none">{creator.students}</p>
                </div>
                <div className="text-left md:text-center">
                  <p className="text-[12px] text-muted-foreground font-bold mb-1">Sessions</p>
                  <p className="text-[20px] sm:text-[24px] font-extrabold text-foreground leading-none">{creator.sessions}</p>
                </div>
                <div className="text-left md:text-center">
                  <p className="text-[12px] text-muted-foreground font-bold mb-1">Rating</p>
                  <p className="text-[20px] sm:text-[24px] font-extrabold text-foreground leading-none flex items-baseline gap-1">
                    {creator.rating} <span className="text-[14px] text-muted-foreground font-bold">/5</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ══════════ 2. TABS & OFFERINGS ══════════ */}
        <CreatorTabs sessions={sessions} courses={courses} groups={groups} />

        {/* ══════════ 3. ABOUT (Editorial Premium) ══════════ */}
        <div className="px-5 sm:px-10 py-16 sm:py-24 bg-background border-t border-border/50">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

            {/* Left: Huge typography */}
            <div className="lg:w-[45%] shrink-0">
              <span className="inline-block px-3.5 py-1.5 bg-muted text-muted-foreground text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-6">
                About the creator
              </span>
              <h2 className="text-3xl sm:text-[40px] lg:text-[44px] font-extrabold text-foreground tracking-tight leading-[1.05] mb-8">
                The coach who&apos;s been in the room
              </h2>
              <div className="space-y-5 text-[15px] sm:text-[16px] text-muted-foreground leading-relaxed font-medium">
                {creator.bioLong.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Right: Skills, Companies & Video Bento */}
            <div className="flex-1 flex flex-col gap-4 w-full">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Premium Video Block */}
                <div className="rounded-[20px] overflow-hidden bg-black aspect-[4/3] sm:aspect-auto sm:h-[220px] relative group shadow-sm">
                  <video controls className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" src="/videos/demo.mp4" poster={creator.avatar} />
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-3 py-1.5 rounded-full pointer-events-none">
                    Intro Video
                  </div>
                </div>

                {/* Companies Block */}
                <div className="bg-muted/30 border border-border/50 rounded-[20px] p-6 flex flex-col justify-center">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-5">Students Placed At</p>
                  <div className="flex flex-wrap gap-2">
                    {companies.map((c) => (
                      <span key={c} className="px-3 py-1.5 bg-background border border-border rounded-full text-[12px] font-bold text-foreground/80 shadow-sm cursor-default">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Skills Block */}
                <div className="bg-muted/30 border border-border/50 rounded-[20px] p-6 flex flex-col justify-center">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-5">Core Expertise</p>
                  <div className="flex flex-col gap-3.5">
                    {creator.skills.map((s) => (
                      <div key={s.label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-background shadow-sm flex items-center justify-center border border-border/50 shrink-0">
                          <FontAwesomeIcon icon={s.icon} className="size-3.5 text-foreground" />
                        </div>
                        <span className="text-[13.5px] font-bold text-foreground/90">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Block */}
                <div className="bg-foreground rounded-[20px] p-6 flex flex-col justify-between text-background relative overflow-hidden shadow-sm">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-background/10 rounded-full blur-2xl pointer-events-none" />
                  <div>
                    <h3 className="text-[18px] font-extrabold mb-2 relative z-10">Book a 1:1 Session</h3>
                    <p className="text-[13px] text-background/80 font-medium mb-6 relative z-10 leading-snug">Get a personalised action plan to land your dream design role.</p>
                  </div>
                  <Button className="w-full bg-background text-foreground hover:bg-muted rounded-full text-[13px] font-extrabold relative z-10 py-5">
                    <FontAwesomeIcon icon={faCalendarCheck} className="size-3.5 mr-2" />
                    Book Session — ₹2,500
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ══════════ 5. REVIEWS ══════════ */}
        <div className="bg-background">
          <UserTestimonials
            heading="What people are saying"
            subheading="TESTIMONIALS"
            testimonials={reviews.map((r) => ({
              id: r.id,
              name: r.name,
              niche: r.role,
              quote: r.text,
              initials: r.initials,
            }))}
          />
        </div>

        {/* ══════════ 6. FAQ ══════════ */}
        <Faqs items={faqs.map((f) => ({ question: f.q, answer: f.a }))} />

      </div>

      <BookSessionBar name={creator.name} />
    </div>
  )
}
