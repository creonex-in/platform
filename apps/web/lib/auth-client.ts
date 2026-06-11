import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

// All /api/auth/* calls proxied by next.config.ts → NestJS
export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [adminClient()],
})

export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session['user']
