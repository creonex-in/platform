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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { BadgesButton } from './badges-button'
import { BookSessionBar } from './book-session-bar'
import TestimonialsDeck from '@/components/landing/shared/testimonials-deck'

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

// ─── Components ──────────────────────────────────────────────────────────────

function OfferingCard({ item }: { item: OfferingCard }): React.ReactElement {
  return (
    <div className="flex flex-col group rounded-[16px] overflow-hidden border border-border hover:border-primary/45 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-200 bg-card cursor-pointer p-2">
      <div className="relative aspect-[16/10] rounded-[10px] overflow-hidden bg-muted mb-2.5">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-[1.02] transition-transform duration-355 ease-out"
        />
        {item.badge && item.badgeVariant && (
          <span className={cn(
            'absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
            item.badgeVariant === 'urgency' ? 'bg-red-50 dark:bg-red-955/60 text-red-650 dark:text-red-400 border border-red-100/50 dark:border-red-900/40' :
            item.badgeVariant === 'open' ? 'bg-emerald-50 dark:bg-emerald-955/60 text-emerald-650 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/40' :
            item.badgeVariant === 'new' ? 'bg-blue-50 dark:bg-blue-955/60 text-blue-655 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/40' :
            'bg-amber-50 dark:bg-amber-955/60 text-amber-655 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/40'
          )}>
            {item.badge}
          </span>
        )}
      </div>
      <div className="px-1 flex flex-col flex-1">
        <p className="text-[12.5px] font-bold text-foreground leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {item.title}
        </p>
        <p className="text-[10.5px] text-muted-foreground font-medium mb-3.5">{item.category}</p>

        <div className="mt-auto pt-2 border-t border-border/60 flex items-center justify-between">
          <span className="font-extrabold text-[13px] text-foreground">₹{item.price.toLocaleString()}</span>
          <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-0.5 text-amber-500">
              <FontAwesomeIcon icon={faStar} className="size-3" />
              {item.rating}
            </span>
            <span className="text-border dark:text-zinc-750">•</span>
            <span className="text-muted-foreground font-medium">{item.views}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreatorProfilePage(): React.ReactElement {
  return (
    <div className="min-h-screen theme-creator bg-background text-foreground pb-20 sm:pb-0 font-sans w-full overflow-x-hidden">
      {/* ══════════ 1. HERO BANNER ══════════ */}
      <div className="w-full h-[140px] sm:h-[180px] relative overflow-hidden bg-muted border-b border-border">
        {/* Ambient glows */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-purple-500/10 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
      </div>

      {/* ══════════ 2. PROFILE HEADER ══════════ */}
      <div className="w-full bg-background pt-0 pb-6 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Avatar Container: Overlapping banner */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-[50px] sm:-mt-[70px] relative z-10 mb-6 gap-6 sm:gap-0">
            <div className="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] rounded-[24px] sm:rounded-[32px] border-[5px] border-background shadow-md bg-muted overflow-hidden shrink-0 relative">
              <Image src={creator.avatar} alt={creator.name} fill className="object-cover" />
            </div>

            {/* Follow & Get in touch buttons */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button className="bg-primary hover:bg-primary/95 active:scale-98 text-primary-foreground px-6 py-2.5 rounded-full text-[13.5px] font-bold transition-all shadow-sm cursor-pointer">
                Follow
              </button>
              <button className="bg-card hover:bg-muted active:scale-98 text-foreground border border-border px-6 py-2.5 rounded-full text-[13.5px] font-bold transition-all shadow-sm cursor-pointer">
                Get in touch
              </button>
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-sm">
                <FontAwesomeIcon icon={faShareNodes} className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Name & Bio section */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                <h1 className="text-[24px] sm:text-[28px] font-extrabold text-foreground tracking-tight leading-none font-display">
                  {creator.name}
                </h1>
                <span className="bg-slate-900 dark:bg-zinc-800 text-white text-[9px] font-bold px-2 py-[2.5px] rounded-[5px] flex items-center gap-1 shrink-0 mt-0.5 border border-slate-800 dark:border-zinc-700">
                  PRO <FontAwesomeIcon icon={faBolt} className="size-[8px] text-amber-400" />
                </span>
              </div>
              <p className="text-[14px] sm:text-[15px] text-foreground leading-relaxed font-semibold mb-3">
                {creator.bio}
              </p>
              <p className="text-[12px] sm:text-[13px] text-muted-foreground font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                based in {creator.location}
              </p>
            </div>

            {/* Badges & Stats */}
            <div className="flex flex-col sm:items-end gap-5">
              <BadgesButton />
              <div className="flex items-center gap-6 sm:gap-10">
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold mb-0.5 uppercase tracking-wider">Students</p>
                  <p className="text-[18px] sm:text-[22px] font-extrabold text-foreground leading-none">{creator.students}</p>
                </div>
                <div className="border-l border-border h-8" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold mb-0.5 uppercase tracking-wider">Sessions</p>
                  <p className="text-[18px] sm:text-[22px] font-extrabold text-foreground leading-none">{creator.sessions}</p>
                </div>
                <div className="border-l border-border h-8" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold mb-0.5 uppercase tracking-wider">Rating</p>
                  <p className="text-[18px] sm:text-[22px] font-extrabold text-foreground leading-none flex items-baseline gap-1">
                    {creator.rating} <span className="text-[12px] text-muted-foreground font-bold">/5</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ 3. INTRO / ABOUT ══════════ */}
      <div className="w-full bg-background py-12 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left side: Bio & Placed companies */}
            <div className="w-full lg:col-span-7 space-y-8">
              <div>
                <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">About the Coach</h2>
                <div className="space-y-4 text-[14px] sm:text-[14.5px] text-muted-foreground leading-relaxed font-medium">
                  {creator.bioLong.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Students Placed At</p>
                <div className="flex flex-wrap gap-2">
                  {companies.map((c) => (
                    <span key={c} className="px-3 py-1.5 bg-muted/40 border border-border rounded-full text-[12px] font-semibold text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.01)] cursor-default">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Video, Skills */}
            <div className="w-full lg:col-span-5 flex flex-col gap-6">
              <div className="rounded-[18px] overflow-hidden bg-black aspect-[16/10] relative group shadow-sm border border-border">
                <video controls className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" src="/videos/demo.mp4" poster={creator.avatar} />
                <div className="absolute top-3.5 left-3.5 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full pointer-events-none">
                  Intro Video
                </div>
              </div>

              <div className="bg-muted/30 border border-border rounded-[18px] p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Core Expertise</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {creator.skills.map((s) => (
                    <div key={s.label} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-card shadow-sm flex items-center justify-center border border-border shrink-0">
                        <FontAwesomeIcon icon={s.icon} className="size-3 text-foreground" />
                      </div>
                      <span className="text-[12.5px] font-semibold text-foreground">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ 4. TABS & OFFERINGS (SERVICES BELOW INTRO) ══════════ */}
      <div className="w-full bg-muted/5 py-12 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="all">
            <div className="overflow-x-auto scrollbar-hide mb-8">
              <TabsList className="h-auto gap-2 bg-muted/50 dark:bg-muted/30 p-1 justify-start flex rounded-full w-fit max-w-full">
                {[
                  { value: 'all', label: 'All Services', count: courses.length + sessions.length + groups.length },
                  { value: 'sessions', label: '1:1 Calls', count: sessions.length },
                  { value: 'courses', label: 'Digital Products', count: courses.length },
                  { value: 'groups', label: 'Communities', count: groups.length },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-full px-4 sm:px-5 py-2 text-[12.5px] sm:text-[13px] font-bold text-muted-foreground data-[state=active]:text-background dark:data-[state=active]:text-foreground data-[state=active]:bg-foreground dark:data-[state=active]:bg-background transition-all cursor-pointer whitespace-nowrap"
                  >
                    {tab.label}
                    {tab.count > 0 && <span className="ml-1.5 text-[10px] opacity-75 font-semibold">({tab.count})</span>}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="mt-0">
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {[...sessions, ...courses, ...groups].map((item) => <OfferingCard key={item.id} item={item} />)}
                </div>
              </TabsContent>
              <TabsContent value="sessions" className="mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {sessions.map((item) => <OfferingCard key={item.id} item={item} />)}
                </div>
              </TabsContent>
              <TabsContent value="courses" className="mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {courses.map((item) => <OfferingCard key={item.id} item={item} />)}
                </div>
              </TabsContent>
              <TabsContent value="groups" className="mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {groups.map((item) => <OfferingCard key={item.id} item={item} />)}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* ══════════ 5. CTA BANNER ══════════ */}
      <div className="w-full bg-background py-12 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-[20px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="mb-6 md:mb-0 max-w-xl relative z-10">
              <h3 className="text-[17px] sm:text-[19px] font-bold mb-2 text-foreground font-display">Book a 1:1 Session with Arjun</h3>
              <p className="text-[13px] text-muted-foreground font-medium leading-relaxed">
                Get a personalised career review, portfolio feedback, and a step-by-step action plan to land your dream design role.
              </p>
            </div>
            <button className="bg-primary text-primary-foreground hover:bg-primary/95 active:scale-98 transition-all px-8 py-3.5 rounded-full text-[13.5px] font-bold flex items-center justify-center gap-2 shrink-0 self-start md:self-auto cursor-pointer shadow-sm relative z-10">
              <FontAwesomeIcon icon={faCalendarCheck} className="size-3.5" />
              Book Session — ₹2,500
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ 6. TESTIMONIALS (SHARED IMPORT) ══════════ */}
      <TestimonialsDeck
        testimonials={reviews.map((r) => ({
          id: r.id,
          name: r.name,
          niche: `${r.role} (formerly ${r.before} ➔ ${r.after})`,
          quote: r.text,
          initials: r.initials,
        }))}
        label="Testimonials"
        heading={
          <>
            Success stories,{" "}
            <span className="text-muted-foreground">real results.</span>
          </>
        }
        description="Read about the direct career breakthroughs and salary increments achieved by design coaching candidates."
      />

      {/* ══════════ 7. FAQ ══════════ */}
      <div className="w-full bg-background py-14 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-14">
            {/* Left Column: Heading */}
            <div className="md:w-[30%] shrink-0">
              <span className="bg-muted text-muted-foreground text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3.5 inline-block border border-border/60">
                Support
              </span>
              <h2 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight mb-2.5 font-display">
                Frequently Asked Questions
              </h2>
              <p className="text-[13px] text-muted-foreground font-medium leading-relaxed max-w-[240px]">
                Guiding you through our coaching procedures and services
              </p>
            </div>

            {/* Right Column: Accordion */}
            <div className="flex-1 flex flex-col">
              <Accordion multiple={false} className="space-y-1">
                {faqs.map((f, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border-b border-border py-1 last:border-b-0"
                  >
                    <AccordionTrigger className="text-[13.5px] font-semibold text-foreground hover:text-primary py-3.5 text-left hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-4.5 font-medium">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-8 text-center md:text-right">
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Still got questions? <a href="mailto:hi@creonex.in" className="text-primary underline hover:text-primary/80 transition-colors">hi@creonex.in</a>
                </p>
              </div>
            </div>

        </div>
      </div>
    </div>

      <BookSessionBar name={creator.name} />
    </div>
  )
}

