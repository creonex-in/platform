import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type {
  DigitalAccessResponse,
  LearnerBookingItem,
  LearnerGoal,
  LearnerNote,
  LearnerOverview,
  LearnerProfile,
  LearnerSavedItem,
  UpdateLearnerProfileRequest,
} from '@creonex/types'

export interface CreateNoteBody {
  title: string
  content?: string
  bookingId?: string
  offeringId?: string
}
export interface CreateGoalBody {
  title: string
  targetDate?: string
}
export interface SavedTargetBody {
  targetType: 'creator' | 'offering'
  targetId: string
}

export const learnerService = {
  // reads (server: pass cookieHeader)
  getOverview: (cookieHeader?: string) =>
    api.get<LearnerOverview>(endpoints.learner.overview, { cookieHeader }),
  getMyBookings: (cookieHeader?: string) =>
    api.get<LearnerBookingItem[]>(endpoints.bookings.myList, { cookieHeader }),
  getSaved: (cookieHeader?: string) =>
    api.get<LearnerSavedItem[]>(endpoints.learner.saved, { cookieHeader }),
  getNotes: (cookieHeader?: string) =>
    api.get<LearnerNote[]>(endpoints.learner.notes, { cookieHeader }),
  getGoals: (cookieHeader?: string) =>
    api.get<LearnerGoal[]>(endpoints.learner.goals, { cookieHeader }),
  getProfile: (cookieHeader?: string) =>
    api.get<LearnerProfile>(endpoints.users.learnerProfile, { cookieHeader }),
  getDigitalAccess: (bookingId: string) =>
    api.get<DigitalAccessResponse>(endpoints.uploads.digitalAccess(bookingId)),

  // saved
  addSaved: (body: SavedTargetBody) => api.post(endpoints.learner.saved, body),
  removeSaved: (body: SavedTargetBody) =>
    api.delete(
      `${endpoints.learner.saved}?targetType=${body.targetType}&targetId=${encodeURIComponent(body.targetId)}`,
    ),

  // notes
  createNote: (body: CreateNoteBody) => api.post<LearnerNote>(endpoints.learner.notes, body),
  updateNote: (id: string, body: Partial<CreateNoteBody>) =>
    api.patch<LearnerNote>(endpoints.learner.noteById(id), body),
  deleteNote: (id: string) => api.delete(endpoints.learner.noteById(id)),

  // goals
  createGoal: (body: CreateGoalBody) => api.post<LearnerGoal[]>(endpoints.learner.goals, body),
  updateGoal: (id: string, body: { title?: string; targetDate?: string; status?: string }) =>
    api.patch<LearnerGoal[]>(endpoints.learner.goalById(id), body),
  deleteGoal: (id: string) => api.delete(endpoints.learner.goalById(id)),

  // profile + booking cancel
  updateProfile: (body: UpdateLearnerProfileRequest) =>
    api.patch<LearnerProfile>(endpoints.users.learnerProfile, body),
  cancelBooking: (id: string, reason?: string) =>
    api.post(endpoints.bookings.cancelMine(id), { reason }),
}
