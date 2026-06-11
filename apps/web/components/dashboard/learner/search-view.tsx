'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CreatorCard } from '@/components/dashboard/learner/creator-card'
import { FilterChipGroup } from '@/components/dashboard/learner/filter-chip-group'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import type { Creator } from '@/types/creator'

const niches = [
  { label: 'All', value: 'all' },
  { label: 'Design', value: 'UI/UX Design' },
  { label: 'Coding', value: 'DSA & Coding' },
  { label: 'CAT', value: 'CAT Preparation' },
  { label: 'Finance', value: 'Personal Finance' },
  { label: 'System Design', value: 'System Design' },
]

const prices = [
  { label: 'Any price', value: 'all' },
  { label: 'Under ₹500', value: 'lt500' },
  { label: '₹500–800', value: '500-800' },
  { label: '₹800+', value: 'gt800' },
]

const tiers = [
  { label: 'All tiers', value: 'all' },
  { label: 'Elite', value: 'elite' },
  { label: 'Verified', value: 'verified' },
  { label: 'Rising', value: 'rising' },
]

type SortKey = 'recommended' | 'rating' | 'price-asc' | 'price-desc'

interface SearchViewProps {
  experts: Creator[]
}

export function SearchView({ experts }: SearchViewProps): React.ReactElement {
  const params = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [niche, setNiche] = useState('all')
  const [price, setPrice] = useState('all')
  const [tier, setTier] = useState('all')
  const [sort, setSort] = useState<SortKey>('recommended')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = experts.filter((c) => {
      const matchQuery =
        q === '' ||
        c.name.toLowerCase().includes(q) ||
        c.niche.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      const matchNiche = niche === 'all' || c.niche === niche
      const matchTier = tier === 'all' || c.cqsTier === tier
      const matchPrice =
        price === 'all' ||
        (price === 'lt500' && c.sessionPrice < 500) ||
        (price === '500-800' && c.sessionPrice >= 500 && c.sessionPrice <= 800) ||
        (price === 'gt800' && c.sessionPrice > 800)
      return matchQuery && matchNiche && matchTier && matchPrice
    })

    const sorted = [...filtered]
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    else if (sort === 'price-asc') sorted.sort((a, b) => a.sessionPrice - b.sessionPrice)
    else if (sort === 'price-desc') sorted.sort((a, b) => b.sessionPrice - a.sessionPrice)
    else sorted.sort((a, b) => b.cqsScore - a.cqsScore)
    return sorted
  }, [experts, query, niche, price, tier, sort])

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
        <p className="text-sm font-medium">Find a 1:1 expert</p>
        <p className="text-xs text-muted-foreground">
          Book live one-on-one mentorship, billed per session. Looking for self-paced courses
          instead? Head to Courses.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search experts, topics, skills…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 rounded-full pl-11"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-10 w-full rounded-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="rating">Top rated</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card/50 p-4">
        {[
          { label: 'Category', chips: niches, value: niche, onChange: setNiche },
          { label: 'Price', chips: prices, value: price, onChange: setPrice },
          { label: 'Quality (CQS)', chips: tiers, value: tier, onChange: setTier },
        ].map((row) => (
          <div key={row.label} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">{row.label}</span>
            <FilterChipGroup chips={row.chips} value={row.value} onChange={row.onChange} />
          </div>
        ))}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={faMagnifyingGlass}
          title="No experts found"
          description="Try a different keyword or clear the filters."
        />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {results.length} expert{results.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((creator, i) => (
              <CreatorCard key={creator.id} creator={creator} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
