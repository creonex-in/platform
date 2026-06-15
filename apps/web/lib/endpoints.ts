export const endpoints = {
  users: {
    me:             '/api/v1/users/me',
    creatorProfile: '/api/v1/users/me/creator-profile',
    learnerProfile: '/api/v1/users/me/learner-profile',
    addCreatorRole: '/api/v1/users/me/add-creator-role',
  },
  onboarding: {
    learnerStep1: '/api/v1/onboarding/learner/step-1',
    creatorStep1: '/api/v1/onboarding/creator/step-1',
    creatorStep2: '/api/v1/onboarding/creator/step-2',
    creatorStep3: '/api/v1/onboarding/creator/step-3',
    creatorStep4: '/api/v1/onboarding/creator/step-4',
    creatorUsernameCheck: (username: string) =>
      `/api/v1/onboarding/creator/username-check?username=${encodeURIComponent(username)}`,
  },
  offerings: {
    me:               '/api/v1/offerings/me',
    eligibility:      '/api/v1/offerings/eligibility',
    stats:            '/api/v1/offerings/stats',
    create:           '/api/v1/offerings',
    byId:             (id: string) => `/api/v1/offerings/${id}`,
    status:           (id: string) => `/api/v1/offerings/${id}/status`,
  },
  creators: {
    byUsername: (username: string) => `/api/v1/creators/${username}`,
  },
  calendar: {
    status:     '/api/v1/calendar/status',
    connect:    '/api/v1/calendar/google/connect',
    disconnect: '/api/v1/calendar/disconnect',
  },
  bookings: {
    creatorList:  '/api/v1/creator/bookings',
    cancelById:   (id: string) => `/api/v1/creator/bookings/${id}/cancel`,
    create:       '/api/v1/bookings',
    createGuest:  '/api/v1/bookings/guest',
    confirm:      (id: string) => `/api/v1/bookings/${id}/confirm`,
    confirmGuest: (id: string) => `/api/v1/bookings/guest/${id}/confirm`,
    myList:       '/api/v1/bookings/me',
  },
  availability: {
    slots: (offeringId: string) => `/api/v1/availability/offerings/${offeringId}/slots`,
  },
  uploads: {
    presign:       '/api/v1/uploads/presign',
    confirm:       '/api/v1/uploads/confirm',
    delete:        '/api/v1/uploads/delete',
    digitalAccess: (bookingId: string) => `/api/v1/uploads/digital/${bookingId}`,
  },
  payouts: {
    kyc:      '/api/v1/payouts/kyc',
    earnings: '/api/v1/payouts/earnings',
    ledger:   '/api/v1/payouts/ledger',
    history:  '/api/v1/payouts/history',
  },
  testimonials: {
    creatorList:       '/api/v1/creator/testimonials',
    updateVisibility:  (id: string) => `/api/v1/creator/testimonials/${id}/visibility`,
    submit:            (username: string) => `/api/v1/testimonials/submit/${username}`,
  },
  schedules: {
    list:      '/api/v1/schedules',
    create:    '/api/v1/schedules',
    byId:      (id: string) => `/api/v1/schedules/${id}`,
    rules:     (sid: string) => `/api/v1/schedules/${sid}/rules`,
    rule:      (sid: string, rid: string) => `/api/v1/schedules/${sid}/rules/${rid}`,
    overrides: (sid: string) => `/api/v1/schedules/${sid}/overrides`,
    override:  (sid: string, oid: string) => `/api/v1/schedules/${sid}/overrides/${oid}`,
  },
}
