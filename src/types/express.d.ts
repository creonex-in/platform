declare global {
  namespace Express {
    interface Request {
      auth?: {
        clerkUserId: string
        sessionId: string
        userId: string
        roles: ('learner' | 'creator')[]
        onboardingComplete: boolean
        onboardingStep: number
      }
      rawBody?: Buffer
    }
  }
}

export { }