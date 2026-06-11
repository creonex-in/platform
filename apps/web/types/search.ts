export const CATEGORIES = [
  "UI/UX Design",
  "Full Stack Dev",
  "Govt. Exam Prep",
  "Photography",
  "Digital Marketing",
  "Music Production",
  "Content Creation",
  "Finance & Investing",
  "Fitness & Yoga",
  "Data Science",
  "Video Editing",
  "Graphic Design",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ICON: Record<Category, string> = {
  "UI/UX Design": "🎨",
  "Full Stack Dev": "💻",
  "Govt. Exam Prep": "📚",
  "Photography": "📷",
  "Digital Marketing": "📣",
  "Music Production": "🎵",
  "Content Creation": "✍️",
  "Finance & Investing": "📈",
  "Fitness & Yoga": "🧘",
  "Data Science": "🔬",
  "Video Editing": "🎬",
  "Graphic Design": "🖌️",
};

/** What kind of entity a search result represents */
export type SearchResultType = "creator" | "course" | "category" | "learning-path";

/**
 * A single search result returned from the API.
 * subtitle: secondary descriptor, e.g. "Creator · 4.8★" or "12 lessons · By Rahul M."
 */
export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
  thumbnailUrl?: string;
}

export interface HeroSearchProps {
  /** Fired on Enter / Search button click */
  onSearch?: (query: string, category: Category | null) => void;
  /** Fired when user picks or clears a category (pill or dropdown) */
  onCategorySelect?: (category: Category | null) => void;
  /**
   * Structured results to show in the dropdown.
   * Pass from parent when connected to the search API.
   * Falls back to category suggestions when undefined or empty.
   */
  results?: SearchResult[];
  isLoading?: boolean;
  className?: string;
}
