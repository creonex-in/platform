import 'server-only'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { parseRoles, type UserRole } from '@creonex/types'
import type { UserContext } from '@creonex/types'
import { getMe } from '@/dal/users.dal'

/*
 * Server-side auth + RBAC guards.
 *
 * These run inside protected layouts/pages (Server Components) — NOT middleware.
 * They own the real authorization decisions: middleware (proxy.ts) only checks
 * that a session cookie exists. Each guard either returns the authenticated
 * user or throws a redirect (never returns null), so callers can rely on the
 * result being present.
 *
 * Session lookup goes through the cached `getMe()` (dal/users.dal.ts), so
 * calling a guard plus another dal helper in the same request issues a single
 * /users/me call.
 */

/** Where to send authenticated users who lack a required role. */
const ROLE_FALLBACK: Record<UserRole, string> = {
  // Has a session but not a creator → their learner home.
  creator: '/',
  // Every account has `learner` by default, so this only fires for
  // creator/admin-only accounts → route them to their creator home.
  learner: '/creator',
  admin: '/',
}

/** Current request path, forwarded by middleware as `x-pathname`. */
async function currentPath(): Promise<string | null> {
  const h = await headers()
  return h.get('x-pathname')
}

function toSignIn(redirectTo: string | null): never {
  const target = redirectTo
    ? `/sign-in?redirect_url=${encodeURIComponent(redirectTo)}`
    : '/sign-in'
  redirect(target)
}

/** Require an authenticated session. Redirects to sign-in otherwise. */
export async function requireAuth(): Promise<UserContext> {
  const user = await getMe()
  if (!user) toSignIn(await currentPath())
  return user
}

/** Require an authenticated session that holds `role`. */
export async function requireRole(role: UserRole): Promise<UserContext> {
  const user = await requireAuth()
  if (!parseRoles(user.role).includes(role)) {
    redirect(ROLE_FALLBACK[role])
  }
  return user
}

export const requireCreator = (): Promise<UserContext> => requireRole('creator')

export const requireLearner = (): Promise<UserContext> => requireRole('learner')
