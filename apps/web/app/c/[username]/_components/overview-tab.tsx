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

  // Availability slots with format type (1:1 Call vs Group Call)
  const mockupSlots = [
    { day: '16', label: '16 Jun', status: '3 slots', urgent: false, isGroup: false },
    { day: '19', label: '19 Jun', status: '1 slot', urgent: true, isGroup: true },
    { day: '21', label: '21 Jun', status: '2 slots', urgent: false, isGroup: false },
    { day: '24', label: '24 Jun', status: '5 slots', urgent: false, isGroup: true },
    { day: '26', label: '26 Jun', status: '2 slots', urgent: false, isGroup: false },
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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Left Column: Bio & Community */}
      <div className="xl:col-span-8 flex flex-col gap-8">
        
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
      <div className="xl:col-span-4 flex flex-col gap-6">
        
        {/* Availability Calendar */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-extrabold text-foreground font-display flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCalendar} className="size-4 text-primary" />
              <span>Availability On {currentMonthName}</span>
            </h3>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="text-xs font-bold text-primary hover:underline cursor-pointer bg-transparent border-none outline-none"
            >
              See More
            </button>
          </div>

          {/* Formats Legend Bar */}
          <div className="flex flex-wrap gap-1.5 mb-4 mt-1 border-b border-border/40 pb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
              <span className="size-1.5 rounded-full bg-primary shrink-0" />
              <span>1:1 Sessions</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold border border-border">
              <span className="size-1.5 rounded-full bg-muted-foreground shrink-0" />
              <span>Group Calls</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {mockupSlots.map((slot, i) => (
              <a
                key={i}
                href="#offerings"
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-150 text-center hover:shadow-sm ${
                  slot.isGroup
                    ? 'border-border/50 hover:border-border hover:bg-muted/50 bg-muted/20'
                    : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5 bg-primary/[0.03]'
                }`}
              >
                <span className="text-xl font-extrabold text-foreground leading-none mb-2">{slot.day}</span>
                
                {/* Format Type Indicator */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold mb-1.5 uppercase tracking-wide leading-none ${
                  slot.isGroup ? 'text-muted-foreground' : 'text-primary'
                }`}>
                  <span className={`size-1.5 rounded-full shrink-0 ${slot.isGroup ? 'bg-muted-foreground' : 'bg-primary'}`} />
                  <span>{slot.isGroup ? 'Group' : '1:1'}</span>
                </span>

                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none ${
                  slot.urgent 
                    ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                    : 'bg-background text-muted-foreground border border-border/50'
                }`}>
                  {slot.status}
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
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {allMockupSlots.map((slot, i) => (
                  <a
                    key={i}
                    href="#offerings"
                    onClick={() => setIsCalendarOpen(false)}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-150 text-center hover:shadow-sm ${
                      slot.isGroup
                        ? 'border-border/50 hover:border-border hover:bg-muted/50 bg-muted/20'
                        : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5 bg-primary/[0.03]'
                    }`}
                  >
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{slot.month}</span>
                    <span className="text-xl font-extrabold text-foreground leading-none mb-1.5">{slot.day}</span>
                    
                    {/* Format Type Indicator inside Popup */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold mb-1.5 uppercase tracking-wide leading-none ${
                      slot.isGroup ? 'text-muted-foreground' : 'text-primary'
                    }`}>
                      <span className={`size-1.5 rounded-full shrink-0 ${slot.isGroup ? 'bg-muted-foreground' : 'bg-primary'}`} />
                      <span>{slot.isGroup ? 'Group' : '1:1'}</span>
                    </span>

                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none ${
                      slot.urgent 
                        ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                        : 'bg-background text-muted-foreground border border-border/50'
                    }`}>
                      {slot.status}
                    </span>
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
