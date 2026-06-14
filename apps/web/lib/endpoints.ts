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
    creatorList: '/api/v1/creator/bookings',
    cancelById:  (id: string) => `/api/v1/creator/bookings/${id}/cancel`,
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
