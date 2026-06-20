import {
  faVideo, faFile, faChalkboard,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons'
import {
  faYoutube, faLinkedin, faInstagram, faXTwitter,
} from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export interface TypeConfig {
  label: string
  tabLabel: string
  icon: IconDefinition
  accentBg: string
  accentText: string
  accentRing: string
  gradient: string
}

export const TYPE_CONFIG: Record<string, TypeConfig> = {
  one_on_one: {
    label: '1:1 Session',
    tabLabel: '1:1 Calls',
    icon: faVideo,
    accentBg: 'bg-primary/10',
    accentText: 'text-primary',
    accentRing: 'ring-primary/20',
    gradient: 'from-primary to-primary/80',
  },
  live_event: {
    label: 'Live Event',
    tabLabel: 'Live Events',
    icon: faChalkboard,
    accentBg: 'bg-primary/10',
    accentText: 'text-primary',
    accentRing: 'ring-primary/20',
    gradient: 'from-primary to-primary/80',
  },
  digital: {
    label: 'Digital Product',
    tabLabel: 'Digital Products',
    icon: faFile,
    accentBg: 'bg-primary/10',
    accentText: 'text-primary',
    accentRing: 'ring-primary/20',
    gradient: 'from-primary to-primary/80',
  },
}

export const getTypeConfig = (type: string): TypeConfig =>
  TYPE_CONFIG[type] ?? TYPE_CONFIG.one_on_one

export const SOCIAL_ICONS: Record<string, { icon: IconDefinition; color: string; label: string }> = {
  youtube:   { icon: faYoutube,  color: 'text-red-500',    label: 'YouTube'  },
  linkedin:  { icon: faLinkedin, color: 'text-blue-600',   label: 'LinkedIn' },
  instagram: { icon: faInstagram,color: 'text-pink-500',   label: 'Instagram'},
  twitter:   { icon: faXTwitter, color: 'text-foreground', label: 'X'        },
  website:   { icon: faGlobe,    color: 'text-primary',    label: 'Website'  },
}

export const isBannerUrl = (s: string): boolean =>
  s.startsWith('http') || s.startsWith('/')

export const FAQS: { q: string; a: string }[] = [
  { q: 'What happens in a 1:1 session?', a: 'You and the creator meet virtually for the duration you booked. You can discuss your goals, get feedback, or work through a specific problem together.' },
  { q: 'How do I book and pay?', a: "Click Book Now, pick a slot, pay via UPI, card, or net banking. You'll get a calendar invite instantly." },
  { q: 'Can I reschedule?', a: 'Yes — up to 24 hours before the session, at no charge. Use the link in your confirmation email.' },
  { q: 'Is my payment secure?', a: 'All payments are processed by our payment partner and held in escrow until the session is completed.' },
]
