import {
  faHouse, faCompass, faCalendarDay, faBookOpen, faUser, faGaugeHigh,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export interface NavItem {
  label: string
  href: string
  icon: IconDefinition
}

/**
 * Single source of truth for learner navigation. Primary destinations are
 * rendered ONCE per breakpoint — header links on desktop, bottom tab bar on
 * mobile. The account menu does NOT repeat these; it only holds account actions.
 */
export const LEARNER_PRIMARY_NAV: NavItem[] = [
  { label: 'Home', href: '/learner/dashboard', icon: faHouse },
  { label: 'Explore', href: '/explore', icon: faCompass },
  { label: 'Schedule', href: '/learner/schedule', icon: faCalendarDay },
  { label: 'Library', href: '/learner/library', icon: faBookOpen },
]

/** Account-level actions for the avatar menu (NOT primary nav). Sign out is added by UserMenu. */
export const LEARNER_ACCOUNT_NAV: NavItem[] = [
  { label: 'Account', href: '/learner/account', icon: faUser },
]

/** Discovery header has no other nav surface, so its avatar menu carries the destinations. */
export const discoveryMenuNav = (dashboardHref: string): NavItem[] => [
  { label: 'Dashboard', href: dashboardHref, icon: faGaugeHigh },
  { label: 'My Library', href: '/learner/library', icon: faBookOpen },
  { label: 'Account', href: '/learner/account', icon: faUser },
]
