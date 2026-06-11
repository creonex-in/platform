'use client'

import { useMemo, useState } from 'react'
import { CourseCard } from '@/components/dashboard/learner/course-card'
import { FilterChipGroup } from '@/components/dashboard/learner/filter-chip-group'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons'
import type { Course, CourseLevel } from '@/types/course'

const niches = [
  { label: 'All categories', value: 'all' },
  { label: 'Design', value: 'UI/UX Design' },
  { label: 'CAT', value: 'cat' },
  { label: 'Coding', value: 'DSA & Coding' },
  { label: 'Finance', value: 'Personal Finance' },
  { label: 'System Design', value: 'System Design' },
]

const levels = [
  { label: 'All levels', value: 'all' },
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
]

const ratings = [
  { label: 'Any rating', value: 'all' },
  { label: '4.5+ ★', value: '4.5' },
  { label: '4.8+ ★', value: '4.8' },
]

const cqsTiers = [
  { label: 'Any CQS', value: 'all' },
  { label: 'CQS 90+ (Elite)', value: '90' },
  { label: 'CQS 80+ (Verified)', value: '80' },
]

type SortKey = 'recommended' | 'rating' | 'popular' | 'price-asc' | 'price-desc'

interface CoursesViewProps {
  courses: Course[]
}

export function CoursesView({ courses }: CoursesViewProps): React.ReactElement {
  const [niche, setNiche] = useState('all')
  const [level, setLevel] = useState('all')
  const [minRating, setMinRating] = useState('all')
  const [minCqs, setMinCqs] = useState('all')
  const [sort, setSort] = useState<SortKey>('recommended')

  const results = useMemo(() => {
    const filtered = courses.filter((c) => {
      const matchNiche =
        niche === 'all' || c.niche === niche || c.niche.toLowerCase().includes(niche.toLowerCase())
      const matchLevel = level === 'all' || c.level === (level as CourseLevel)
      const matchRating = minRating === 'all' || c.rating >= Number(minRating)
      const matchCqs = minCqs === 'all' || c.cqsScore >= Number(minCqs)
      return matchNiche && matchLevel && matchRating && matchCqs
    })

    const sorted = [...filtered]
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    else if (sort === 'popular') sorted.sort((a, b) => b.students - a.students)
    else if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    else sorted.sort((a, b) => b.cqsScore - a.cqsScore)
    return sorted
  }, [courses, niche, level, minRating, minCqs, sort])

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
        <p className="text-sm font-medium">Self-paced courses</p>
        <p className="text-xs text-muted-foreground">
          One-time payment, lifetime access. Learn anytime at your own pace — different from live
          1:1 sessions.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {results.length} course{results.length !== 1 ? 's' : ''}
        </p>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-9 w-44 rounded-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended (CQS)</SelectItem>
            <SelectItem value="rating">Top rated</SelectItem>
            <SelectItem value="popular">Most popular</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card/50 p-4">
        {[
          { label: 'Category', chips: niches, value: niche, onChange: setNiche },
          { label: 'Level', chips: levels, value: level, onChange: setLevel },
          { label: 'Rating', chips: ratings, value: minRating, onChange: setMinRating },
          { label: 'Quality (CQS)', chips: cqsTiers, value: minCqs, onChange: setMinCqs },
        ].map((row) => (
          <div key={row.label} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">{row.label}</span>
            <FilterChipGroup chips={row.chips} value={row.value} onChange={row.onChange} />
          </div>
        ))}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={faGraduationCap}
          title="No courses found"
          description="Try a different category, level, or filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
