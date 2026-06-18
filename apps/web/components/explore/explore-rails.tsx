import { browseOfferings, getRecommendedOfferings } from '@/dal/explore.dal'
import { nicheLabel } from '@/lib/niche'
import { ExploreRail } from './explore-rail'

/** Personalized — only renders for a signed-in learner who has interests + matching offerings. */
export async function RecommendedRail() {
  const { items } = await getRecommendedOfferings()
  return (
    <ExploreRail
      eyebrow="For you"
      title="Recommended for you"
      subtitle="Picked from the niches you follow"
      items={items}
    />
  )
}

/** Live & happening — soonest live events first. */
export async function LiveRail() {
  const { items } = await browseOfferings({ type: 'live_event', sort: 'newest', limit: 10 })
  return (
    <ExploreRail
      eyebrow="Live"
      title="Live & happening"
      subtitle="Workshops and group sessions you can join"
      items={items}
      seeAllHref="/explore?type=live"
    />
  )
}

/** Trending — most-booked offerings (MVP proxy for velocity). */
export async function TrendingRail() {
  const { items } = await browseOfferings({ sort: 'top_rated', limit: 10 })
  return (
    <ExploreRail
      eyebrow="Trending"
      title="Trending this week"
      subtitle="What learners are booking right now"
      items={items}
      seeAllHref="/explore?sort=top_rated"
    />
  )
}

/** Top rated in a specific niche. */
export async function NicheRail({ niche }: { niche: string }) {
  const { items } = await browseOfferings({ niche, sort: 'top_rated', limit: 10 })
  return (
    <ExploreRail
      title={`Top rated in ${nicheLabel(niche)}`}
      items={items}
      seeAllHref={`/explore?niche=${niche}&sort=top_rated`}
    />
  )
}
