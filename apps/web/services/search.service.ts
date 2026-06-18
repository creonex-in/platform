import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { SearchResult } from '@/types/search'

export const searchService = {
  getSuggestions: (q: string) =>
    api.get<SearchResult[]>(endpoints.search.suggestions(q)),
}
