import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { PublicCreatorProfile } from '@creonex/types'

export const creatorsService = {
  getPublicProfile: (username: string) =>
    api.get<PublicCreatorProfile>(endpoints.creators.byUsername(username)),
}
