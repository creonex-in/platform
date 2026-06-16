import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { CreatorDashboardSummary } from '@creonex/types'

export const dashboardService = {
  getSummary: (tz: string, cookieHeader?: string) =>
    api.get<CreatorDashboardSummary>(endpoints.dashboard.summary(tz), { cookieHeader }),
}
