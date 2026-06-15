import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { CreatorProfile, UpdateCreatorProfileRequest } from '@creonex/types'

export const usersService = {
  getCreatorProfile: () => api.get<CreatorProfile>(endpoints.users.creatorProfile),

  updateCreatorProfile: (body: UpdateCreatorProfileRequest) =>
    api.patch<CreatorProfile>(endpoints.users.creatorProfile, body),
}
