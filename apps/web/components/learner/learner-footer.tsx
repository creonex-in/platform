'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck, faShieldHalved, faHeadset,
  faGear, faRightFromBracket, faArrowRightArrowLeft
} from '@fortawesome/free-solid-svg-icons'

export function LearnerFooter(): React.ReactElement {
  const router = useRouter()

  async function logout(): Promise<void> {
    await authClient.signOut()
    router.push('/sign-in')
  }

  return (
    <footer className="hidden border-t border-border bg-card md:block mt-20 pb-8">
      {/* 1. Trust Row */}
      <div className="border-b border-border/60 py-6 bg-muted/20">
        <div className="mx-auto max-w-screen-2xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-muted-foreground font-semibold">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <FontAwesomeIcon icon={faCircleCheck} className="size-5 text-primary" />
            <div>
              <p className="text-foreground font-bold">100% Verified Practitioners</p>
              <p className="text-[10px] font-normal text-muted-foreground mt-0.5">Learn exclusively from proven industry experts.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <FontAwesomeIcon icon={faShieldHalved} className="size-5 text-primary" />
            <div>
              <p className="text-foreground font-bold">Secure Booking Guarantee</p>
              <p className="text-[10px] font-normal text-muted-foreground mt-0.5">Refund protections apply for cancelled sessions.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <FontAwesomeIcon icon={faHeadset} className="size-5 text-primary" />
            <div>
              <p className="text-foreground font-bold">Dedicated Help & Support</p>
              <p className="text-[10px] font-normal text-muted-foreground mt-0.5">Get 24/7 assistance on bookings and scheduling.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Link Columns */}
      <div className="mx-auto max-w-screen-2xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        {/* Col 1 */}
        <div className="space-y-3.5">
          <h5 className="font-bold text-foreground text-xs uppercase tracking-wider">Explore Creonex</h5>
          <ul className="space-y-2 text-muted-foreground text-xs">
            <li>
              <Link href="/explore" className="hover:text-primary hover:underline transition-colors">
                Search Mentors
              </Link>
            </li>
            <li>
              <Link href="/explore?type=live_event" className="hover:text-primary hover:underline transition-colors">
                Live Workshops
              </Link>
            </li>
            <li>
              <Link href="/explore?type=digital" className="hover:text-primary hover:underline transition-colors">
                Digital Resources
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 2 */}
        <div className="space-y-3.5">
          <h5 className="font-bold text-foreground text-xs uppercase tracking-wider">My Workspace</h5>
          <ul className="space-y-2 text-muted-foreground text-xs">
            <li>
              <Link href="/learner" className="hover:text-primary hover:underline transition-colors">
                My Learning Hub
              </Link>
            </li>
            <li>
              <Link href="/schedule" className="hover:text-primary hover:underline transition-colors">
                Upcoming Schedule
              </Link>
            </li>
            <li>
              <Link href="/my-learning" className="hover:text-primary hover:underline transition-colors">
                Digital Vault
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-3.5">
          <h5 className="font-bold text-foreground text-xs uppercase tracking-wider">Legal & Policy</h5>
          <ul className="space-y-2 text-muted-foreground text-xs">
            <li>
              <Link href="/refund-policy" className="hover:text-primary hover:underline transition-colors">
                Refund Guidelines
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-primary hover:underline transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-primary hover:underline transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4 - Switch Account options */}
        <div className="space-y-3.5">
          <h5 className="font-bold text-foreground text-xs uppercase tracking-wider">Settings</h5>
          <ul className="space-y-2 text-muted-foreground text-xs">
            <li>
              <Link href="/creator" className="flex items-center gap-1.5 hover:text-primary hover:underline transition-colors font-semibold">
                <FontAwesomeIcon icon={faArrowRightArrowLeft} className="size-3" />
                Switch to Creator
              </Link>
            </li>
            <li>
              <Link href="/settings" className="flex items-center gap-1.5 hover:text-primary hover:underline transition-colors">
                <FontAwesomeIcon icon={faGear} className="size-3" />
                Account Settings
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 hover:text-destructive hover:underline transition-colors text-left"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="size-3" />
                Log out
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Row */}
      <div className="mx-auto max-w-screen-2xl px-6 pt-6 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Creonex Inc. All rights reserved.</span>
        <span className="font-display font-bold text-foreground tracking-tight text-sm">
          creo<span className="text-primary">nex</span>
        </span>
      </div>
    </footer>
  )
}
