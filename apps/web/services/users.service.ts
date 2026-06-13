import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { CreatorProfile } from '@creonex/types'

export const usersService = {
  getCreatorProfile: () => api.get<CreatorProfile>(endpoints.users.creatorProfile),
}
