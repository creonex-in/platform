'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/services/users.service'
import type { UpdateCreatorProfileRequest } from '@creonex/types'

/**
 * Partial update of the creator's own profile. On success, invalidates the
 * cached profile (`['creator-profile-me']`, see useCreatorProfile) so any
 * consumer refetches the fresh data.
 */
export function useUpdateCreatorProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateCreatorProfileRequest) => usersService.updateCreatorProfile(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['creator-profile-me'] })
    },
  })
}
