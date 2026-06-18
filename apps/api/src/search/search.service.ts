import { Injectable } from '@nestjs/common'
import { NICHES, type Niche } from '@creonex/types'
import { SearchRepository } from './search.repository'

export interface SearchResult {
  id: string
  type: 'creator' | 'course' | 'category'
  title: string
  subtitle?: string
  href: string
  thumbnailUrl?: string | null
}

/** Human labels for niches (kept in sync with the web NICHE_OPTIONS list). */
const NICHE_LABELS: Record<Niche, string> = {
  cat_mba_prep: 'CAT / MBA Prep',
  coding_dsa: 'Coding & DSA',
  personal_finance: 'Personal Finance',
  fitness_nutrition: 'Fitness & Nutrition',
  design_creative: 'Design & Creative',
  language_learning: 'Language Learning',
  digital_marketing: 'Digital Marketing',
  music_arts: 'Music & Arts',
  upsc_govt_exams: 'UPSC & Govt Exams',
  mental_wellness: 'Mental Wellness',
  photography: 'Photography',
  science_research: 'Science & Research',
  real_estate: 'Real Estate',
  writing_content: 'Writing & Content',
  ai_data_science: 'AI & Data Science',
  gaming_esports: 'Gaming & Esports',
  cooking_food: 'Cooking & Food',
  interview_prep: 'Interview Prep',
  ayurveda_yoga: 'Ayurveda & Yoga',
  startup_product: 'Startup & Product',
}

const inr = (paise: number) => `₹${Math.round(paise / 100).toLocaleString('en-IN')}`

@Injectable()
export class SearchService {
  constructor(private readonly repo: SearchRepository) {}

  /** Typeahead across live creators, their live offerings, and matching niches. */
  async getSuggestions(q: string, limit: number): Promise<SearchResult[]> {
    const term = q.trim()
    if (term.length < 2) return []

    const perGroup = Math.min(Math.max(Math.ceil(limit / 2), 4), 8)

    const [creators, offers] = await Promise.all([
      this.repo.searchCreators(term, perGroup),
      this.repo.searchOfferings(term, perGroup),
    ])

    const creatorResults: SearchResult[] = creators.map((c) => {
      const rating = Number(c.rating ?? 0)
      const niche = c.primaryNiche ? NICHE_LABELS[c.primaryNiche as Niche] : ''
      const subtitle = [niche, rating > 0 ? `${rating.toFixed(1)}★` : '']
        .filter(Boolean)
        .join(' · ')
      return {
        id: c.id,
        type: 'creator',
        title: c.displayName ?? c.username ?? 'Creator',
        subtitle: subtitle || undefined,
        href: `/c/${c.username}`,
        thumbnailUrl: c.profilePhotoUrl,
      }
    })

    const offerResults: SearchResult[] = offers.map((o) => ({
      id: o.id,
      type: 'course',
      title: o.title,
      subtitle: `by @${o.username} · ${inr(o.price)}`,
      href: `/c/${o.username}`,
      thumbnailUrl: o.thumbnailUrl,
    }))

    // Niche matches are static + cheap — resolved in-memory against the label map.
    const lower = term.toLowerCase()
    const nicheResults: SearchResult[] = (NICHES as readonly Niche[])
      .filter((n) => NICHE_LABELS[n].toLowerCase().includes(lower) || n.includes(lower))
      .slice(0, 4)
      .map((n) => ({
        id: `niche-${n}`,
        type: 'category',
        title: NICHE_LABELS[n],
        subtitle: 'Topic',
        href: `/explore?niche=${n}`,
      }))

    return [...creatorResults, ...offerResults, ...nicheResults]
  }
}
