import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { CreatorProfile, UpdateCreatorProfileRequest, UserContext } from '@creonex/types'

export interface UpdateMeBody {
  name?: string
  image?: string
}

export const usersService = {
  getCreatorProfile: () => api.get<CreatorProfile>(endpoints.users.creatorProfile),

  updateCreatorProfile: (body: UpdateCreatorProfileRequest) =>
    api.patch<CreatorProfile>(endpoints.users.creatorProfile, body),

  updateMe: (body: UpdateMeBody) => api.patch<UserContext>(endpoints.users.me, body),
}
