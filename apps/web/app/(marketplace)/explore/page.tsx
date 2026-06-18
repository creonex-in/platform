import type { Metadata } from 'next'
import { ExploreFilterBar } from '@/components/explore/explore-filter-bar'
import { SessionCard } from '@/components/explore/session-card'
import { DigitalAssetCard } from '@/components/explore/digital-asset-card'
import { LiveWorkshopCard } from '@/components/explore/live-workshop-card'

export const metadata: Metadata = {
  title: 'Explore — Creonex',
  description: "Discover 1:1 sessions, live workshops, and digital resources from India's top creators.",
}

// ── Data types ────────────────────────────────────────────────────────────────

type Creator = { name: string; username: string; title: string; avatarUrl?: string | null }

type SessionOffer = {
  kind: 'session'; id: string; variant: '1on1' | 'group'
  creator: Creator; bio: string; rating: number; reviewCount: number
  sessionLabel: string; pricePerSlot: number; durationMinutes: number; totalPrice: number
  niche: string
}
type DigitalOffer = {
  kind: 'digital'; id: string
  creator: Creator; bio: string; assetName: string; assetType: string; price: number
  niche: string
}
type LiveOffer = {
  kind: 'live'; id: string
  creator: Creator; title: string; seatsFilled: number; seatsTotal: number
  price: number; startsInLabel: string; countdownLabel?: string
  niche: string
}
type AnyOffer = SessionOffer | DigitalOffer | LiveOffer

// ── Mock data (swap for API when ready) ──────────────────────────────────────

const MOCK_OFFERS: AnyOffer[] = [
  {
    kind: 'session', id: 's1', variant: '1on1',
    creator: { name: 'Ananya Gupta', username: 'ananyagupta', title: 'Product Leader · Flipkart' },
    bio: "I've shipped 20+ features at Flipkart & Meesho. Let me help you build products India loves.",
    rating: 4.9, reviewCount: 120,
    sessionLabel: '1:1 Strategy', pricePerSlot: 199, durationMinutes: 30, totalPrice: 1999,
    niche: 'startup_product',
  },
  {
    kind: 'session', id: 's2', variant: 'group',
    creator: { name: 'Ananya Gupta', username: 'ananyagupta', title: 'Product Leader · Flipkart' },
    bio: "Weekly group sessions for PMs and founders — structured, hands-on, outcome-driven.",
    rating: 4.9, reviewCount: 120,
    sessionLabel: 'Group Session', pricePerSlot: 199, durationMinutes: 45, totalPrice: 1299,
    niche: 'startup_product',
  },
  {
    kind: 'live', id: 'l1',
    creator: { name: 'Srikar Vempati', username: 'srikar', title: 'Product Strategist' },
    title: 'LIVE Product Strategy Workshop',
    seatsFilled: 15, seatsTotal: 30,
    price: 499, startsInLabel: 'Live now', countdownLabel: '00 : 01 : 00 : 02',
    niche: 'startup_product',
  },
  {
    kind: 'digital', id: 'd1',
    creator: { name: 'Ananya Gupta', username: 'ananyagupta', title: 'Product Leader · Flipkart' },
    bio: 'The exact PRD template used to ship 20+ successful features at Flipkart.',
    assetName: 'PRD Template', assetType: 'Digital Download', price: 499,
    niche: 'startup_product',
  },
  {
    kind: 'session', id: 's3', variant: '1on1',
    creator: { name: 'Arjun Verma', username: 'arjunverma', title: 'Senior SDE · Google' },
    bio: 'Crack FAANG with confidence — DSA + System Design structured for Indian engineers.',
    rating: 4.8, reviewCount: 97,
    sessionLabel: '1:1 Mock Interview', pricePerSlot: 299, durationMinutes: 60, totalPrice: 2499,
    niche: 'coding_dsa',
  },
  {
    kind: 'session', id: 's4', variant: 'group',
    creator: { name: 'Priya Sharma', username: 'priyasharma', title: 'Data Science Lead · Swiggy' },
    bio: 'Weekly cohort covering ML fundamentals, feature engineering, and model deployment.',
    rating: 4.7, reviewCount: 64,
    sessionLabel: 'Weekly Cohort', pricePerSlot: 149, durationMinutes: 90, totalPrice: 999,
    niche: 'ai_data_science',
  },
  {
    kind: 'digital', id: 'd2',
    creator: { name: 'Arjun Verma', username: 'arjunverma', title: 'Senior SDE · Google' },
    bio: 'A 200-page DSA handbook with patterns, templates, and solved examples for FAANG prep.',
    assetName: 'DSA Patterns Handbook', assetType: 'PDF · 200 pages', price: 349,
    niche: 'coding_dsa',
  },
  {
    kind: 'live', id: 'l2',
    creator: { name: 'Sneha Nair', username: 'snehanair', title: 'Digital Marketing Head' },
    title: 'Zero to ₹1L/month with Digital Marketing',
    seatsFilled: 22, seatsTotal: 50,
    price: 299, startsInLabel: 'Starts in 2h', countdownLabel: '00 : 02 : 00 : 00',
    niche: 'digital_marketing',
  },
  {
    kind: 'session', id: 's5', variant: '1on1',
    creator: { name: 'Vikram Singh', username: 'vikramsingh', title: 'CFA · Financial Planner' },
    bio: 'Personalised financial plan covering mutual funds, tax saving, and early retirement.',
    rating: 4.9, reviewCount: 82,
    sessionLabel: '1:1 Finance Review', pricePerSlot: 249, durationMinutes: 45, totalPrice: 1499,
    niche: 'personal_finance',
  },
  {
    kind: 'digital', id: 'd3',
    creator: { name: 'Vikram Singh', username: 'vikramsingh', title: 'CFA · Financial Planner' },
    bio: 'Complete SIP calculator + investment tracker spreadsheet built for Indian retail investors.',
    assetName: 'SIP Tracker 2025', assetType: 'Excel Template', price: 199,
    niche: 'personal_finance',
  },
]

// ── Filtering ─────────────────────────────────────────────────────────────────

function matchesType(o: AnyOffer, type: string): boolean {
  if (type === 'all') return true
  if (type === 'live')    return o.kind === 'live'
  if (type === 'digital') return o.kind === 'digital'
  if (o.kind !== 'session') return false
  return o.variant === type
}

function matchesNiche(o: AnyOffer, niche: string): boolean {
  return niche === 'all' || o.niche === niche
}

function matchesQuery(o: AnyOffer, q: string): boolean {
  if (!q) return true
  const lower = q.toLowerCase()
  return [
    o.creator.name, o.creator.title,
    o.kind === 'live'    ? o.title    : '',
    o.kind === 'digital' ? o.assetName : '',
    o.kind === 'session' || o.kind === 'digital' ? o.bio : '',
  ].join(' ').toLowerCase().includes(lower)
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ type?: string; q?: string; niche?: string }>
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const { type = 'all', q = '', niche = 'all' } = await searchParams

  const filtered = MOCK_OFFERS.filter(
    (o) => matchesType(o, type) && matchesNiche(o, niche) && matchesQuery(o, q),
  )

  return (
    <div className="min-h-dvh">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="border-b border-border/50 bg-background">
        <div className="page-container py-5">
          {q ? (
            <div>
              <p className="text-label">Search results</p>
              <h1 className="text-h3 mt-0.5">&ldquo;{q}&rdquo;</h1>
            </div>
          ) : (
            <div>
              <p className="text-label">Marketplace</p>
              <h1 className="text-h3 mt-0.5">Explore creators &amp; offerings</h1>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter + grid ───────────────────────────────────── */}
      <div className="page-container py-6 pb-20">
        <ExploreFilterBar activeType={type} activeNiche={niche} />

        {/* Result count */}
        <p className="text-body-sm mt-4">
          {filtered.length === 0
            ? 'No results'
            : `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'}`}
          {q && (
            <> for &ldquo;<span className="font-medium text-foreground">{q}</span>&rdquo;</>
          )}
        </p>

        {filtered.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((offer) => {
              if (offer.kind === 'session') {
                return (
                  <SessionCard
                    key={offer.id}
                    {...offer}
                    href={`/c/${offer.creator.username}`}
                  />
                )
              }
              if (offer.kind === 'digital') {
                return (
                  <DigitalAssetCard
                    key={offer.id}
                    {...offer}
                    href={`/c/${offer.creator.username}`}
                  />
                )
              }
              // live
              return (
                <div key={offer.id} className="xl:col-span-2">
                  <LiveWorkshopCard
                    {...offer}
                    href={`/c/${offer.creator.username}`}
                    className="h-full"
                  />
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="mt-24 flex flex-col items-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-h4">Nothing found</p>
            <p className="text-body-sm max-w-xs">
              Try a broader filter or different search term.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
