import type { UserRole } from '@creonex/types'

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string
        email: string
        name: string
        role: string
        roles: UserRole[]
      }
    }
  }
}
