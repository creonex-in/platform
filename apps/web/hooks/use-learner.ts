'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { learnerService, type CreateNoteBody, type SavedTargetBody } from '@/services/learner.service'
import type { UpdateLearnerProfileRequest } from '@creonex/types'

const KEYS = {
  saved: ['learner', 'saved'] as const,
  notes: ['learner', 'notes'] as const,
  overview: ['learner', 'overview'] as const,
  bookings: ['learner', 'bookings'] as const,
}

// ── Saved ──
export function useSaved() {
  return useQuery({ queryKey: KEYS.saved, queryFn: () => learnerService.getSaved(), staleTime: 30_000 })
}
export function useToggleSaved() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ saved, ...body }: SavedTargetBody & { saved: boolean }) =>
      saved ? learnerService.removeSaved(body) : learnerService.addSaved(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.saved })
      void qc.invalidateQueries({ queryKey: KEYS.overview })
    },
  })
}

// ── Notes ──
export function useNotes() {
  return useQuery({ queryKey: KEYS.notes, queryFn: () => learnerService.getNotes(), staleTime: 30_000 })
}
export function useNoteMutations() {
  const qc = useQueryClient()
  const invalidate = () => void qc.invalidateQueries({ queryKey: KEYS.notes })
  return {
    create: useMutation({ mutationFn: (b: CreateNoteBody) => learnerService.createNote(b), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, ...b }: { id: string } & Partial<CreateNoteBody>) => learnerService.updateNote(id, b),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id: string) => learnerService.deleteNote(id), onSuccess: invalidate }),
  }
}

// ── Profile + booking cancel ──
export function useUpdateLearnerProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (b: UpdateLearnerProfileRequest) => learnerService.updateProfile(b),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['learner-profile-me'] }),
  })
}
export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => learnerService.cancelBooking(id, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.bookings })
      void qc.invalidateQueries({ queryKey: KEYS.overview })
    },
  })
}
