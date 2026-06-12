'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { queryKeys } from '@/lib/query-keys'
import type { UserContext } from '@creonex/types'

export function useMe(initialData?: UserContext) {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => userService.getMe(),
    initialData,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAddCreatorRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => userService.addCreatorRole(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() })
    },
  })
}
