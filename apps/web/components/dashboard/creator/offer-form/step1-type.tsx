'use client'

import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faCalendarDays, faUsers, faFileLines } from '@fortawesome/free-solid-svg-icons'
import type { OfferType } from '@/types/offer'
import { cn } from '@/lib/utils'

const offerTypes: { type: OfferType; label: string; description: string; icon: typeof faPhone }[] = [
  { type: 'one_on_one', label: '1:1 Session', description: 'One-on-one video call with a learner', icon: faPhone },
  { type: 'workshop', label: 'Workshop', description: 'Live group session with multiple attendees', icon: faCalendarDays },
  { type: 'group', label: 'Group Call', description: 'Small group mentorship session', icon: faUsers },
  { type: 'digital', label: 'Digital Product', description: 'Template, guide, or downloadable resource', icon: faFileLines },
] as const

interface Step1TypeProps {
  value: OfferType | ''
  onChange: (type: OfferType) => void
}

export function Step1Type({ value, onChange }: Step1TypeProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">What type of offer?</h3>
        <p className="text-sm text-muted-foreground mt-1">Choose the format for your new offer.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {offerTypes.map((item, i) => (
          <motion.button
            key={item.type}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onChange(item.type)}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 text-left transition-all',
              value === item.type
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:border-foreground/20'
            )}
          >
            <div className={cn(
              'size-9 rounded-lg flex items-center justify-center shrink-0',
              value === item.type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              <FontAwesomeIcon icon={item.icon} className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
