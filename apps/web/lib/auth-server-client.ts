import { createAuthClient } from 'better-auth/client'
import { adminClient } from 'better-auth/client/plugins'

// Used in middleware and server-side contexts.
// Needs absolute baseURL because there is no browser origin in Edge/Node.
export const serverAuthClient = createAuthClient({
  baseURL: process.env.API_URL ?? 'http://localhost:3000',
  basePath: '/api/auth',
  plugins: [adminClient()],
})
