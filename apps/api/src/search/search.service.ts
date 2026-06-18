import { Injectable } from '@nestjs/common'

interface SearchResult {
  id: string
  type: 'creator' | 'course' | 'category'
  title: string
  subtitle?: string
  href: string
  thumbnailUrl?: string | null
}

// ── Phase-1 sample data ───────────────────────────────────────────────────────
// Swap this for real Drizzle queries once the DB has live creators/offerings.

const SAMPLE: SearchResult[] = [
  // Creators
  { id: 'c1', type: 'creator', title: 'Rahul Mehta',       subtitle: 'UI/UX Design · 4.9★',       href: '/c/rahulmehta',    thumbnailUrl: null },
  { id: 'c2', type: 'creator', title: 'Priya Sharma',      subtitle: 'Data Science · 4.7★',        href: '/c/priyasharma',   thumbnailUrl: null },
  { id: 'c3', type: 'creator', title: 'Arjun Verma',       subtitle: 'Full Stack Dev · 4.8★',      href: '/c/arjunverma',    thumbnailUrl: null },
  { id: 'c4', type: 'creator', title: 'Sneha Nair',        subtitle: 'Digital Marketing · 4.6★',   href: '/c/snehanair',     thumbnailUrl: null },
  { id: 'c5', type: 'creator', title: 'Vikram Singh',      subtitle: 'Personal Finance · 4.9★',    href: '/c/vikramsingh',   thumbnailUrl: null },
  { id: 'c6', type: 'creator', title: 'Ananya Reddy',      subtitle: 'Fitness & Yoga · 4.8★',      href: '/c/ananyareddy',   thumbnailUrl: null },
  { id: 'c7', type: 'creator', title: 'Karan Malhotra',    subtitle: 'Music Production · 4.7★',    href: '/c/karanmalhotra', thumbnailUrl: null },
  { id: 'c8', type: 'creator', title: 'Divya Iyer',        subtitle: 'Content Writing · 4.5★',     href: '/c/divyaiyer',     thumbnailUrl: null },

  // Courses / Offerings
  { id: 'o1', type: 'course',  title: 'React Interview Prep',           subtitle: 'by @arjunverma · ₹999',      href: '/c/arjunverma' },
  { id: 'o2', type: 'course',  title: 'Figma for Beginners',            subtitle: 'by @rahulmehta · ₹499',      href: '/c/rahulmehta' },
  { id: 'o3', type: 'course',  title: 'System Design Fundamentals',     subtitle: 'by @arjunverma · ₹1,499',    href: '/c/arjunverma' },
  { id: 'o4', type: 'course',  title: 'Digital Marketing Strategy',     subtitle: 'by @snehanair · ₹799',       href: '/c/snehanair' },
  { id: 'o5', type: 'course',  title: 'Personal Finance Basics',        subtitle: 'by @vikramsingh · ₹599',     href: '/c/vikramsingh' },
  { id: 'o6', type: 'course',  title: 'Data Science Roadmap 2025',      subtitle: 'by @priyasharma · ₹1,299',   href: '/c/priyasharma' },
  { id: 'o7', type: 'course',  title: 'Career Switch to Tech',          subtitle: 'by @arjunverma · ₹1,999',    href: '/c/arjunverma' },
  { id: 'o8', type: 'course',  title: 'UI Portfolio Review (1:1)',       subtitle: 'by @rahulmehta · ₹1,200',    href: '/c/rahulmehta' },
  { id: 'o9', type: 'course',  title: 'Yoga for Desk Workers',          subtitle: 'by @ananyareddy · ₹399',     href: '/c/ananyareddy' },
  { id: 'o10', type: 'course', title: 'Music Theory for Producers',     subtitle: 'by @karanmalhotra · ₹699',   href: '/c/karanmalhotra' },

  // Categories / Topics
  { id: 'cat1',  type: 'category', title: 'UI/UX Design',         subtitle: 'Topic', href: '/explore?niche=design_creative' },
  { id: 'cat2',  type: 'category', title: 'Data Science',         subtitle: 'Topic', href: '/explore?niche=ai_data_science' },
  { id: 'cat3',  type: 'category', title: 'Full Stack Dev',       subtitle: 'Topic', href: '/explore?niche=coding_dsa' },
  { id: 'cat4',  type: 'category', title: 'Digital Marketing',    subtitle: 'Topic', href: '/explore?niche=digital_marketing' },
  { id: 'cat5',  type: 'category', title: 'Personal Finance',     subtitle: 'Topic', href: '/explore?niche=personal_finance' },
  { id: 'cat6',  type: 'category', title: 'Fitness & Yoga',       subtitle: 'Topic', href: '/explore?niche=fitness_nutrition' },
  { id: 'cat7',  type: 'category', title: 'Music & Arts',         subtitle: 'Topic', href: '/explore?niche=music_arts' },
  { id: 'cat8',  type: 'category', title: 'Content Writing',      subtitle: 'Topic', href: '/explore?niche=writing_content' },
  { id: 'cat9',  type: 'category', title: 'Interview Prep',       subtitle: 'Topic', href: '/explore?niche=interview_prep' },
  { id: 'cat10', type: 'category', title: 'Startup & Product',    subtitle: 'Topic', href: '/explore?niche=startup_product' },
]

@Injectable()
export class SearchService {
  getSuggestions(q: string, limit: number): SearchResult[] {
    const term = q.trim().toLowerCase()
    if (!term || term.length < 2) return []

    return SAMPLE
      .filter((r) =>
        r.title.toLowerCase().includes(term) ||
        (r.subtitle ?? '').toLowerCase().includes(term),
      )
      .slice(0, limit)
  }
}
