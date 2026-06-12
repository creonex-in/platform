import type { UserSession } from '@mguay/nestjs-better-auth'

/**
 * Extends the base UserSession with our custom `role` field.
 * The admin plugin stores role in the DB user table and returns it in sessions,
 * but @mguay/nestjs-better-auth's generic UserSession type doesn't include it.
 */
export type AppUserSession = UserSession & {
  user: UserSession['user'] & { role: string }
}
