import {
  faVideo, faFile, faChalkboard, faUsers,
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
    accentBg: 'bg-violet-100 dark:bg-violet-900/30',
    accentText: 'text-violet-600 dark:text-violet-400',
    accentRing: 'ring-violet-200 dark:ring-violet-800',
    gradient: 'from-violet-500 to-purple-600',
  },
  course: {
    label: 'Course',
    tabLabel: 'Courses',
    icon: faFile,
    accentBg: 'bg-blue-100 dark:bg-blue-900/30',
    accentText: 'text-blue-600 dark:text-blue-400',
    accentRing: 'ring-blue-200 dark:ring-blue-800',
    gradient: 'from-blue-500 to-indigo-600',
  },
  digital_product: {
    label: 'Digital Product',
    tabLabel: 'Digital Products',
    icon: faFile,
    accentBg: 'bg-amber-100 dark:bg-amber-900/30',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentRing: 'ring-amber-200 dark:ring-amber-800',
    gradient: 'from-amber-500 to-orange-500',
  },
  workshop: {
    label: 'Workshop',
    tabLabel: 'Workshops',
    icon: faChalkboard,
    accentBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentRing: 'ring-emerald-200 dark:ring-emerald-800',
    gradient: 'from-emerald-500 to-teal-600',
  },
  group: {
    label: 'Community',
    tabLabel: 'Communities',
    icon: faUsers,
    accentBg: 'bg-pink-100 dark:bg-pink-900/30',
    accentText: 'text-pink-600 dark:text-pink-400',
    accentRing: 'ring-pink-200 dark:ring-pink-800',
    gradient: 'from-pink-500 to-rose-500',
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

export function getInitials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export const isBannerUrl = (s: string): boolean =>
  s.startsWith('http') || s.startsWith('/')

export const FAQS: { q: string; a: string }[] = [
  { q: 'What happens in a 1:1 session?', a: 'You and the creator meet virtually for the duration you booked. You can discuss your goals, get feedback, or work through a specific problem together.' },
  { q: 'How do I book and pay?', a: "Click Book Now, pick a slot, pay via UPI, card, or net banking. You'll get a calendar invite instantly." },
  { q: 'Can I reschedule?', a: 'Yes — up to 24 hours before the session, at no charge. Use the link in your confirmation email.' },
  { q: 'Is my payment secure?', a: 'All payments are processed by our payment partner and held in escrow until the session is completed.' },
]
