import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { CreatorTestimonialItem } from '@creonex/types'

export const testimonialsService = {
  getCreatorTestimonials: (cookieHeader?: string) =>
    api.get<CreatorTestimonialItem[]>(endpoints.testimonials.creatorList, { cookieHeader }),

  updateVisibility: (id: string, isPublic: boolean) =>
    api.patch<undefined>(endpoints.testimonials.updateVisibility(id), { isPublic }),

  submit: (
    username: string,
    body: { learnerName: string; learnerRole?: string; content: string; rating: number },
  ) => api.post<undefined>(endpoints.testimonials.submit(username), body),
}
