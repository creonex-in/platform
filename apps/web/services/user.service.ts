import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type {
  UserContext,
  CreatorProfile,
  LearnerProfile,
  AddCreatorRoleResponse,
} from '@/types/api'

export const userService = {
  // cookieHeader only used in server components (dal/users.dal.ts)
  getMe: (cookieHeader?: string) =>
    api.get<UserContext>(endpoints.users.me(), { cookieHeader }),

  addCreatorRole: (cookieHeader?: string) =>
    api.post<AddCreatorRoleResponse>(endpoints.users.addCreatorRole(), {}, { cookieHeader }),

  getCreatorProfile: (cookieHeader?: string) =>
    api.get<CreatorProfile>(endpoints.users.creatorProfile(), { cookieHeader }),

  getLearnerProfile: (cookieHeader?: string) =>
    api.get<LearnerProfile>(endpoints.users.learnerProfile(), { cookieHeader }),
}
