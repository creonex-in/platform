'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faUsers, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PublicCreatorProfile } from '@creonex/types'
import { getInitials } from '@/lib/utils'

interface OverviewTabProps {
  profile: PublicCreatorProfile
  displayName: string
}

export function OverviewTab({ profile, displayName }: OverviewTabProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Standard formatting of the primary niche
  const nicheLabel = profile.primaryNiche
    ? profile.primaryNiche.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'expert topics'

  const bioText = profile.bio || `Welcome to my profile! I am a verified creator on Creonex specializing in ${nicheLabel}. I help individuals and teams master advanced concepts, build practical projects, and scale their careers.`

  const truncateBio = bioText.length > 250
  const displayedBio = isBioExpanded || !truncateBio
    ? bioText
    : `${bioText.slice(0, 250)}...`

  // Get current month name
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' })

  // Availability slots matching the clean UI grid pattern
  const mockupSlots = [
    { dayName: 'FRI', date: '8 Feb', slotsStr: '2 Sessions', urgent: false },
    { dayName: 'WED', date: '13 Feb', slotsStr: '1 Session', urgent: true },
    { dayName: 'SUN', date: '13 Feb', slotsStr: '2 Sessions', urgent: false },
    { dayName: 'FRI', date: '17 Feb', slotsStr: '2 Sessions', urgent: false },
    { dayName: 'WED', date: '19 Feb', slotsStr: '2 Sessions', urgent: false },
  ]

  // Expanded slots grid in dialog with format type
  const allMockupSlots = [
    { day: '16', month: 'Jun', status: '3 slots', urgent: false, isGroup: false },
    { day: '19', month: 'Jun', status: '1 slot', urgent: true, isGroup: true },
    { day: '21', month: 'Jun', status: '2 slots', urgent: false, isGroup: false },
    { day: '24', month: 'Jun', status: '5 slots', urgent: false, isGroup: true },
    { day: '26', month: 'Jun', status: '2 slots', urgent: false, isGroup: false },
    { day: '28', month: 'Jun', status: '4 slots', urgent: false, isGroup: true },
    { day: '30', month: 'Jun', status: '1 slot', urgent: true, isGroup: false },
    { day: '02', month: 'Jul', status: '3 slots', urgent: false, isGroup: false },
    { day: '05', month: 'Jul', status: '2 slots', urgent: false, isGroup: true },
    { day: '08', month: 'Jul', status: '5 slots', urgent: false, isGroup: false },
    { day: '10', month: 'Jul', status: '4 slots', urgent: false, isGroup: true },
    { day: '12', month: 'Jul', status: '1 slot', urgent: true, isGroup: false },
  ]

  // Render mock community if profile testimonials are empty, otherwise use testimonials
  const communityMembers = profile.testimonials.length > 0 
    ? profile.testimonials.map((t) => ({
        name: t.learnerName,
        role: t.learnerRole || 'Learner',
        initials: getInitials(t.learnerName),
        image: null
      }))
    : [
        { name: 'Sarah Elson', role: 'UI/UX Designer, Google', initials: 'SE', image: null },
        { name: 'Aditya Mehta', role: 'Frontend Engineer, Swiggy', initials: 'AM', image: null },
        { name: 'Zahir Ahmed', role: 'Product Manager, Stripe', initials: 'ZA', image: null },
      ]

  const motivationTags = [
    'Competency work', 'Helping others', 'Mentorship', 'Learning', 'New ideas', 'Knowledge sharing'
  ]

  const bestSkills = profile.tags.slice(0, 5).length > 0
    ? profile.tags.slice(0, 5)
    : ['Communication', 'Interpersonal Skills', 'Problem Solving', 'Team work', 'Project Management']

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Left Column: Bio & Community */}
      <div className="xl:col-span-7 flex flex-col gap-8 sm:gap-10">
        
        {/* Describe Myself (Bio) */}
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-3 font-display">
            How I'd Describe Myself
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed font-medium">
            {displayedBio}
            {truncateBio && (
              <button
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="ml-1.5 text-primary hover:text-primary/90 font-bold transition-colors cursor-pointer"
              >
                {isBioExpanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </p>
        </div>

        {/* Why I Became A Mentor */}
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-3 font-display">
            Why I Became A Mentor
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed font-medium">
            I am genuinely passionate about sharing practical knowledge in {nicheLabel} and helping next-generation builders bypass common bottlenecks. Mentoring allows me to give back to the community, meet incredibly driven creators, and refine my own insights through collaborative problem-solving.
          </p>
        </div>

        {/* An Ideal Relationship To Me */}
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-3 font-display">
            An Ideal Relationship To Me
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed font-medium">
            I appreciate learners who are curious, come prepared with specific questions or real-world challenges, and are ready to put advice into action immediately. A great mentorship is a dynamic, highly collaborative dialogue built on mutual respect and continuous growth.
          </p>
        </div>

        {/* Community members */}
        <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 font-display">
              <FontAwesomeIcon icon={faUsers} className="size-4.5 text-primary" />
              <span>{displayName}'s Community ({profile.totalSessions + communityMembers.length})</span>
            </h3>
            <a href="#offerings" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              <span>Show All</span>
              <FontAwesomeIcon icon={faChevronRight} className="size-3.5" />
            </a>
          </div>

          <div className="flex flex-col gap-4">
            {communityMembers.map((member, i) => (
              <div key={i} className="flex items-center gap-3 bg-muted/20 rounded-xl p-3 border border-border/50">
                <div className="size-9 sm:size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {member.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground leading-tight">{member.name}</h4>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Availability, Skills & Motivations */}
      <div className="xl:col-span-5 flex flex-col gap-6 sm:gap-8">
        
        {/* Availability Calendar */}
        <div className="flex flex-col">
          <h3 className="text-base sm:text-lg font-bold text-foreground font-display mb-1.5">
            Availability On {currentMonthName}
          </h3>
          
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              {mockupSlots.length * 2 + 3} available slots
            </span>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              See More
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {mockupSlots.map((slot, i) => (
              <a
                key={i}
                href="#offerings"
                className="group flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-card border border-border/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all dark:shadow-none dark:hover:bg-muted/50"
              >
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {slot.dayName}
                </span>
                <span className="text-lg sm:text-xl font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                  {slot.date}
                </span>
                <span className={`text-[10px] sm:text-xs font-medium ${slot.urgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {slot.slotsStr}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Dialog for Available Calendar Slots */}
        <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <DialogContent className="sm:max-w-md bg-card text-foreground border border-border">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                All Available Slots
              </DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p className="text-xs text-muted-foreground mb-4">
                Below are the available dates for bookings in the upcoming weeks. Select any date to view offerings.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {allMockupSlots.map((slot, i) => (
                  <a
                    key={i}
                    href="#offerings"
                    onClick={() => setIsCalendarOpen(false)}
                    className="group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/40 hover:border-border transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-11 h-12 rounded-lg bg-background border border-border/50 shadow-sm shrink-0">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          {slot.month}
                        </span>
                        <span className="text-base font-extrabold text-foreground leading-none mt-0.5">
                          {slot.day}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-foreground leading-none">
                          {slot.isGroup ? 'Group Call' : '1:1 Session'}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <span className={`size-1.5 rounded-full ${slot.urgent ? 'bg-destructive' : 'bg-primary'}`} />
                          {slot.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center size-7 rounded-full bg-background border border-border/50 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
                      <FontAwesomeIcon icon={faChevronRight} className="size-3" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Best Skills */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4 font-display">
            {profile.displayName ? profile.displayName.split(' ')[0] : 'Creator'}'s Best Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {bestSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border/60 bg-muted/20 text-xs font-semibold text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* What Motivates Me */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4 font-display">
            What Motivates Me
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {motivationTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border/60 bg-muted/20 text-xs font-semibold text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
