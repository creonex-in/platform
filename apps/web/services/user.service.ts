import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { UserContext, CreatorProfile, LearnerProfile, AddCreatorRoleResponse } from '@creonex/types'

export const userService = {
  getMe: (cookieHeader?: string) =>
    api.get<UserContext>(endpoints.users.me, { cookieHeader }),

  addCreatorRole: (cookieHeader?: string) =>
    api.post<AddCreatorRoleResponse>(endpoints.users.addCreatorRole, {}, { cookieHeader }),

  getCreatorProfile: (cookieHeader?: string) =>
    api.get<CreatorProfile>(endpoints.users.creatorProfile, { cookieHeader }),

  getLearnerProfile: (cookieHeader?: string) =>
    api.get<LearnerProfile>(endpoints.users.learnerProfile, { cookieHeader }),
}
