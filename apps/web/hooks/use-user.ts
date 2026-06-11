'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import type { UserContext } from '@/types/api'

export const userKeys = {
  me: () => ['user', 'me'] as const,
  creatorProfile: () => ['user', 'creator-profile'] as const,
  learnerProfile: () => ['user', 'learner-profile'] as const,
}

export function useMe(initialData?: UserContext) {
  return useQuery({
    queryKey: userKeys.me(),
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
      queryClient.invalidateQueries({ queryKey: userKeys.me() })
    },
  })
}
