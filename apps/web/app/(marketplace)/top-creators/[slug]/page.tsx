import type { Metadata } from 'next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faTrophy, faStar } from '@fortawesome/free-solid-svg-icons'
import { mockCreators } from '@/data/mock-creators'
import CreatorGrid from './creator-grid'
import ExploreCategories from './explore-categories'

/* ─── slug → display title ─────────────────────────────────── */
const SLUG_TITLE_MAP: Record<string, string> = {
  'dsa-coding': 'DSA & Coding',
  'ui-ux-design': 'UI/UX Design',
  'cat-preparation': 'CAT Preparation',
  'personal-finance': 'Personal Finance',
  'system-design': 'System Design',
  'fitness-nutrition': 'Fitness & Nutrition',
  'mental-wellness': 'Mental Wellness',
  'graphic-design': 'Graphic Design',
  'full-stack': 'Full Stack',
  'cat-quant': 'CAT Quant',
}

function slugToTitle(slug: string): string {
  return (
    SLUG_TITLE_MAP[slug] ??
    slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  )
}

/* ─── photo map (Unsplash HD portraits, face-cropped) ───────── */
const BASE = 'https://images.unsplash.com'
const Q = '?w=600&h=750&fit=crop&crop=face&q=85&auto=format'

const CREATOR_IMAGES: Record<string, string> = {
  c1:  `${BASE}/photo-1494790108377-be9c29b29330${Q}`, // Meera      — woman
  c2:  `${BASE}/photo-1507003211169-0a1dd7228f2d${Q}`, // Aryan      — man
  c3:  `${BASE}/photo-1580489944761-15a19d654956${Q}`, // Priya K    — woman
  c4:  `${BASE}/photo-1560250097-0b93528c311a${Q}`,   // Rohit      — man
  c5:  `${BASE}/photo-1500648767791-00dcc994a43e${Q}`, // Nikhil     — man
  c6:  `${BASE}/photo-1568602471122-7832951cc4c5${Q}`, // Ritesh     — man
  c7:  `${BASE}/photo-1521119989659-a83eee488004${Q}`, // Arjun      — man
  c8:  `${BASE}/photo-1573497019940-1c28c88b4f3e${Q}`, // Sneha      — woman
  c9:  `${BASE}/photo-1472099645785-5658abf4ff4e${Q}`, // Rahul      — man
  c10: `${BASE}/photo-1558222218-b7b54eede3f3${Q}`,   // Karthik    — man
  c11: `${BASE}/photo-1573496359142-b8d87734a5a2${Q}`, // Priya M    — woman
  c12: `${BASE}/photo-1506863530036-1efeddceb993${Q}`, // Vikram     — man
  c13: `${BASE}/photo-1551836022-deb4988cc6c0${Q}`,   // Ananya     — woman
  c14: `${BASE}/photo-1556157382-97eda2d62296${Q}`,   // Leena      — woman
}

/* ─── explore categories ────────────────────────────────────── */
const ALL_CATEGORIES = [
  { label: 'DSA & Coding', slug: 'dsa-coding' },
  { label: 'UI/UX Design', slug: 'ui-ux-design' },
  { label: 'Personal Finance', slug: 'personal-finance' },
  { label: 'System Design', slug: 'system-design' },
  { label: 'CAT Preparation', slug: 'cat-preparation' },
  { label: 'Fitness & Nutrition', slug: 'fitness-nutrition' },
  { label: 'Mental Wellness', slug: 'mental-wellness' },
  { label: 'Graphic Design', slug: 'graphic-design' },
  { label: 'Full Stack', slug: 'full-stack' },
]

/* ─── static data ───────────────────────────────────────────── */
const sortedCreators = [...mockCreators].sort((a, b) => b.cqsScore - a.cqsScore)
const eliteCount = sortedCreators.filter((c) => c.cqsTier === 'elite').length
const avgRating = (
  sortedCreators.reduce((s, c) => s + c.rating, 0) / sortedCreators.length
).toFixed(1)
const creatorsWithImages = sortedCreators.map((c) => ({
  ...c,
  imageUrl:
    CREATOR_IMAGES[c.id] ??
    `https://images.unsplash.com/photo-1500648767791-00dcc994a43e${Q}`,
}))

/* ─── metadata ──────────────────────────────────────────────── */
interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const title = slugToTitle(slug)
  return {
    title: `Top ${title} Creators — Creonex`,
    description: `Discover the best ${title} mentors on Creonex. Ranked by quality score, ratings, and session completion rate.`,
  }
}

/* ─── page ──────────────────────────────────────────────────── */
export default async function TopCreatorsPage({ params }: Props): Promise<React.ReactElement> {
  const { slug } = await params
  const categoryTitle = slugToTitle(slug)
  const relatedCategories = ALL_CATEGORIES.filter((c) => c.slug !== slug)

  return (
    <main className="min-h-screen bg-background">

        {/* ══════════════════════════════════════════════
            HERO — compact
        ══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-b border-border/40 bg-background px-4 py-10 sm:py-12">

          {/* Ambient glow */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/8 blur-[110px]" />
          <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-primary/5 blur-[90px]" />

          <div className="relative mx-auto max-w-5xl">


          {/* Premium Minimal Text with Underline Tracker */}
          <div className="group relative mb-5 inline-block pb-1">
            <p className="font-display text-[10px] font-extrabold uppercase tracking-[0.25em] text-primary/90">
              Curated &amp; Ranked
            </p>
            <div className="absolute bottom-0 left-0 h-[1.5px] w-8 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full" />
          </div>

            {/* Title row — heading left, avatar stack right */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Top{' '}
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {categoryTitle}
                </span>{' '}
                Creators
              </h1>

            </div>

            {/* Description + stats — side by side on desktop */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border/30 pt-4">
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Ranked by CQS — ratings, completion rate, and responsiveness combined.
              </p>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <FontAwesomeIcon icon={faUsers} className="size-3 text-primary/70" />
                  <span className="font-semibold text-foreground">{sortedCreators.length}</span> creators
                </span>
                <span className="h-3 w-px bg-border/60" />
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <FontAwesomeIcon icon={faTrophy} className="size-3 text-amber-500" />
                  <span className="font-semibold text-foreground">{eliteCount}</span> elite
                </span>
                <span className="h-3 w-px bg-border/60" />
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <FontAwesomeIcon icon={faStar} className="size-3 text-amber-400" />
                  <span className="font-semibold text-foreground">{avgRating}</span> avg
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════
            CREATOR GRID + PAGINATION
        ══════════════════════════════════════════════ */}
        <section id="creators" className="px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <CreatorGrid creators={creatorsWithImages} />
          </div>
        </section>

        <ExploreCategories categories={relatedCategories} />

    </main>
  )
}
