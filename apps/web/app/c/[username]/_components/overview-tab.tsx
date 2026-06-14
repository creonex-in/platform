'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faUsers, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PublicCreatorProfile } from '@creonex/types'
import type { AvailableDate } from '@/dal/slots.dal'
import { getInitials } from '@/lib/utils'

interface OverviewTabProps {
  profile: PublicCreatorProfile
  displayName: string
  availableDates: AvailableDate[]
  onBook?: () => void
}

export function OverviewTab({ profile, displayName, availableDates, onBook }: OverviewTabProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const nicheLabel = profile.primaryNiche
    ? profile.primaryNiche.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'expert topics'

  const bioText = profile.bio || `Welcome to my profile! I am a verified creator on Creonex specializing in ${nicheLabel}. I help individuals and teams master advanced concepts, build practical projects, and scale their careers.`

  const truncateBio = bioText.length > 250
  const displayedBio = isBioExpanded || !truncateBio
    ? bioText
    : `${bioText.slice(0, 250)}...`

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' })

  const totalSlots = availableDates.reduce((s, d) => s + d.slotCount, 0)
  const previewSlots = availableDates.slice(0, 6)

  const communityMembers = profile.testimonials.length > 0
    ? profile.testimonials.map((t) => ({
        name: t.learnerName,
        role: t.learnerRole || 'Learner',
        initials: getInitials(t.learnerName),
        image: null,
      }))
    : [
        { name: 'Sarah Elson', role: 'UI/UX Designer, Google', initials: 'SE', image: null },
        { name: 'Aditya Mehta', role: 'Frontend Engineer, Swiggy', initials: 'AM', image: null },
        { name: 'Zahir Ahmed', role: 'Product Manager, Stripe', initials: 'ZA', image: null },
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

        {/* Community members */}
        <div className="rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 font-display">
              <FontAwesomeIcon icon={faUsers} className="size-4.5 text-primary" />
              <span>{displayName}'s Community ({profile.totalSessions + communityMembers.length})</span>
            </h3>
            <button
              onClick={onBook ?? (() => { document.querySelector('#offerings')?.scrollIntoView({ behavior: 'smooth' }) })}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Show All</span>
              <FontAwesomeIcon icon={faChevronRight} className="size-3.5" />
            </button>
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

      {/* Right Column: Availability & Skills */}
      <div className="xl:col-span-5 flex flex-col gap-6 sm:gap-8">

        {/* Availability Calendar */}
        <div className="flex flex-col">
          <h3 className="text-base sm:text-lg font-bold text-foreground font-display mb-1.5">
            Availability On {currentMonthName}
          </h3>

          <div className="flex items-center justify-between mb-5">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              {availableDates.length > 0 ? `${totalSlots} available slots` : 'No availability set yet'}
            </span>
            {availableDates.length > 0 && (
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                See More
              </button>
            )}
          </div>

          {previewSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {previewSlots.map((slot, i) => {
                const label = slot.slotCount === 1 ? 'Only 1 left' : slot.slotCount <= 3 ? 'Few left' : 'Available'
                const labelColor = slot.slotCount === 1 ? 'text-destructive' : slot.slotCount <= 3 ? 'text-amber-500' : 'text-emerald-500'
                return (
                  <button
                    key={i}
                    onClick={onBook ?? (() => { document.querySelector('#offerings')?.scrollIntoView({ behavior: 'smooth' }) })}
                    className="group flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-card border border-border/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all dark:shadow-none dark:hover:bg-muted/50 overflow-hidden cursor-pointer"
                  >
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 whitespace-nowrap">
                      {slot.dayName}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors whitespace-nowrap">
                      {slot.date}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap ${labelColor}`}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 rounded-2xl bg-muted/20 border border-border/40 text-sm text-muted-foreground font-medium">
              <FontAwesomeIcon icon={faCalendar} className="size-4 mr-2 text-muted-foreground/50" />
              Check back soon for available slots
            </div>
          )}
        </div>

        {/* Dialog for All Available Slots */}
        <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <DialogContent className="sm:max-w-md bg-card text-foreground border border-border">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                All Available Slots
              </DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p className="text-xs text-muted-foreground mb-4">
                Available dates for bookings in the upcoming weeks. Select any date to view offerings.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {availableDates.map((slot, i) => {
                  const [day, month] = slot.date.split(' ')
                  const label = slot.slotCount === 1 ? 'Only 1 left' : slot.slotCount <= 3 ? 'Few left' : 'Available'
                  const dotColor = slot.slotCount === 1 ? 'bg-destructive' : slot.slotCount <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                  return (
                    <button
                      key={i}
                      onClick={() => { setIsCalendarOpen(false); onBook ? onBook() : document.querySelector('#offerings')?.scrollIntoView({ behavior: 'smooth' }) }}
                      className="group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/40 hover:border-border transition-all w-full text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-11 h-12 rounded-lg bg-background border border-border/50 shadow-sm shrink-0">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                            {month}
                          </span>
                          <span className="text-base font-extrabold text-foreground leading-none mt-0.5 whitespace-nowrap">
                            {day}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-foreground leading-none whitespace-nowrap">
                            Open for booking
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                            <span className={`size-1.5 rounded-full shrink-0 ${dotColor}`} />
                            {label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center size-7 rounded-full bg-background border border-border/50 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors shrink-0">
                        <FontAwesomeIcon icon={faChevronRight} className="size-3" />
                      </div>
                    </button>
                  )
                })}
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

      </div>
    </div>
  )
}
