export const queryKeys = {
  user: {
    all: ['user'] as const,
    me: () => ['user', 'me'] as const,
    creatorProfile: () => ['user', 'creator-profile'] as const,
    learnerProfile: () => ['user', 'learner-profile'] as const,
  },
} as const
