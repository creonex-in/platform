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
  },
  creators: {
    byUsername: (username: string) => `/api/v1/creators/${username}`,
  },
}
