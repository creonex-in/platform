'use client'

import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { searchService } from '@/services/search.service'

export function useSearchSuggestions(query: string) {
  const q = useDebounce(query, 300)
  return useQuery({
    queryKey: ['search', 'suggestions', q],
    queryFn: () => searchService.getSuggestions(q),
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
    placeholderData: [],
  })
}
