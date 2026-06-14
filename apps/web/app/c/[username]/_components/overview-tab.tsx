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
          <h3 className="text-[17px] font-bold text-foreground mb-3 font-display">
            How I'd Describe Myself
          </h3>
          <p className="text-[14px] sm:text-[14.5px] text-muted-foreground/90 leading-relaxed font-medium">
            {displayedBio}
            {truncateBio && (
              <button
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="ml-1.5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 font-bold transition-colors cursor-pointer"
              >
                {isBioExpanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </p>
        </div>

        {/* Why I Became A Mentor */}
        <div className="flex flex-col">
          <h3 className="text-[17px] font-bold text-foreground mb-3 font-display">
            Why I Became A Mentor
          </h3>
          <p className="text-[14px] sm:text-[14.5px] text-muted-foreground/90 leading-relaxed font-medium">
            I am genuinely passionate about sharing practical knowledge in {nicheLabel} and helping next-generation builders bypass common bottlenecks. Mentoring allows me to give back to the community, meet incredibly driven creators, and refine my own insights through collaborative problem-solving.
          </p>
        </div>

        {/* An Ideal Relationship To Me */}
        <div className="flex flex-col">
          <h3 className="text-[17px] font-bold text-foreground mb-3 font-display">
            An Ideal Relationship To Me
          </h3>
          <p className="text-[14px] sm:text-[14.5px] text-muted-foreground/90 leading-relaxed font-medium">
            I appreciate learners who are curious, come prepared with specific questions or real-world challenges, and are ready to put advice into action immediately. A great mentorship is a dynamic, highly collaborative dialogue built on mutual respect and continuous growth.
          </p>
        </div>

        {/* Community members */}
        <div className="rounded-[20px] bg-[#EEF8FA] dark:bg-cyan-950/20 border border-cyan-100/60 dark:border-cyan-900/40 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] sm:text-[17px] font-bold text-cyan-950 dark:text-cyan-100 flex items-center gap-2 font-display">
              <FontAwesomeIcon icon={faUsers} className="size-4.5 text-cyan-600 dark:text-cyan-400" />
              <span>{displayName}'s Community ({profile.totalSessions + communityMembers.length})</span>
            </h3>
            <a href="#offerings" className="text-[12.5px] font-bold text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-0.5">
              <span>Show All</span>
              <FontAwesomeIcon icon={faChevronRight} className="size-3.5" />
            </a>
          </div>

          <div className="flex flex-col gap-4">
            {communityMembers.map((member, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/70 dark:bg-card/50 rounded-xl p-3 border border-cyan-50/50 dark:border-zinc-800/50 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                <div className="size-9 sm:size-10 rounded-full bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-[13px] shrink-0">
                  {member.initials}
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-foreground leading-tight">{member.name}</h4>
                  <p className="text-[11.5px] text-muted-foreground font-semibold mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Availability, Skills & Motivations */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        
        {/* Availability Calendar */}
        <div className="rounded-[20px] border border-border/80 bg-card p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-extrabold text-foreground font-display flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCalendar} className="size-4 text-cyan-600 dark:text-cyan-400" />
              <span>Availability On {currentMonthName}</span>
            </h3>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="text-[11.5px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer bg-transparent border-none outline-none"
            >
              See More
            </button>
          </div>

          {/* Formats Legend Bar */}
          <div className="flex flex-wrap gap-1.5 mb-4 mt-1 border-b border-border/40 pb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold border border-cyan-100/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
              <span>1:1 Sessions</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold border border-purple-100/30">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
              <span>Group Calls</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {mockupSlots.map((slot, i) => (
              <a
                key={i}
                href="#offerings"
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-150 text-center ${
                  slot.isGroup
                    ? 'border-purple-100/80 dark:border-purple-900/50 hover:border-purple-500/50 hover:bg-purple-500/5 bg-purple-500/[0.01]'
                    : 'border-cyan-100/80 dark:border-cyan-900/50 hover:border-cyan-500/50 hover:bg-cyan-500/5 bg-cyan-500/[0.01]'
                }`}
              >
                <span className="text-[9.5px] text-muted-foreground font-semibold uppercase tracking-wider">Day</span>
                <span className="text-[19px] font-extrabold text-foreground leading-tight my-0.5">{slot.day}</span>
                
                {/* Format Type Indicator */}
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold mb-1.5 uppercase tracking-wide leading-none ${
                  slot.isGroup ? 'text-purple-650 dark:text-purple-400' : 'text-cyan-650 dark:text-cyan-400'
                }`}>
                  <span className={`w-1 h-1 rounded-full shrink-0 ${slot.isGroup ? 'bg-purple-500' : 'bg-cyan-500'}`} />
                  <span>{slot.isGroup ? 'Group' : '1:1 Call'}</span>
                </span>

                <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  slot.urgent 
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 border border-red-100/60 dark:border-red-900/60' 
                    : 'bg-muted text-muted-foreground border border-border/40'
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
              <p className="text-[12px] text-muted-foreground mb-4">
                Below are the available dates for bookings in the upcoming weeks. Select any date to view offerings.
              </p>
              
              <div className="grid grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {allMockupSlots.map((slot, i) => (
                  <a
                    key={i}
                    href="#offerings"
                    onClick={() => setIsCalendarOpen(false)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-150 text-center ${
                      slot.isGroup
                        ? 'border-purple-100 dark:border-purple-900 hover:border-purple-500/55 hover:bg-purple-500/5 bg-purple-500/[0.01]'
                        : 'border-cyan-100 dark:border-cyan-900 hover:border-cyan-500/55 hover:bg-cyan-500/5 bg-cyan-500/[0.01]'
                    }`}
                  >
                    <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{slot.month}</span>
                    <span className="text-[17px] font-extrabold text-foreground leading-tight my-0.5">{slot.day}</span>
                    
                    {/* Format Type Indicator inside Popup */}
                    <span className={`inline-flex items-center gap-1 text-[8.5px] font-bold mb-1.5 uppercase tracking-wide leading-none ${
                      slot.isGroup ? 'text-purple-650 dark:text-purple-400' : 'text-cyan-650 dark:text-cyan-400'
                    }`}>
                      <span className={`w-1 h-1 rounded-full shrink-0 ${slot.isGroup ? 'bg-purple-500' : 'bg-cyan-500'}`} />
                      <span>{slot.isGroup ? 'Group' : '1:1 Call'}</span>
                    </span>

                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                      slot.urgent 
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 border border-red-100/60 dark:border-red-900/60' 
                        : 'bg-muted text-muted-foreground border border-border/40'
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
        <div className="rounded-[20px] border border-border/80 bg-card p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          <h3 className="text-[13.5px] font-bold text-foreground mb-4 font-display">
            {profile.displayName ? profile.displayName.split(' ')[0] : 'Creator'}'s Best Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {bestSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border/60 bg-muted/20 text-[12px] font-semibold text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* What Motivates Me */}
        <div className="rounded-[20px] border border-border/80 bg-card p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          <h3 className="text-[13.5px] font-bold text-foreground mb-4 font-display">
            What Motivates Me
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {motivationTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border/60 bg-muted/20 text-[12px] font-semibold text-foreground"
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
