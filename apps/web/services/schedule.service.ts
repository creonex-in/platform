import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type { Schedule, ScheduleRule, ScheduleOverride } from '@/types/schedule'

export const scheduleService = {
  getSchedules: (cookieHeader?: string) =>
    api.get<Schedule[]>(endpoints.schedules.list, { cookieHeader }),

  getScheduleById: (id: string, cookieHeader?: string) =>
    api.get<Schedule>(endpoints.schedules.byId(id), { cookieHeader }),

  createSchedule: (body: { name: string; timezone: string; isDefault?: boolean }, cookieHeader?: string) =>
    api.post<Schedule>(endpoints.schedules.create, body, { cookieHeader }),

  updateSchedule: (id: string, body: { name?: string; timezone?: string; isDefault?: boolean }) =>
    api.patch<Schedule>(endpoints.schedules.byId(id), body),

  createRule: (sid: string, body: { rrule: string; startTime: string; endTime: string }) =>
    api.post<ScheduleRule>(endpoints.schedules.rules(sid), body),

  updateRule: (sid: string, rid: string, body: { rrule?: string; startTime?: string; endTime?: string }) =>
    api.patch<ScheduleRule>(endpoints.schedules.rule(sid, rid), body),

  deleteRule: (sid: string, rid: string) =>
    api.delete<void>(endpoints.schedules.rule(sid, rid)),

  createOverride: (sid: string, body: { date: string; type: 'blocked' | 'custom'; startTime?: string; endTime?: string }) =>
    api.post<ScheduleOverride>(endpoints.schedules.overrides(sid), body),

  deleteOverride: (sid: string, oid: string) =>
    api.delete<void>(endpoints.schedules.override(sid, oid)),
}
