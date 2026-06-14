import { NextResponse, type NextRequest } from 'next/server'

const isPublicPath = (pathname: string) =>
  pathname === '/' ||
  pathname === '/creators' ||
  pathname.startsWith('/top-creators') ||
  pathname.startsWith('/sign-in') ||
  pathname.startsWith('/sign-up') ||
  pathname.startsWith('/api/')

const isCreatorPath = (pathname: string) =>
  ['/dashboard', '/analytics', '/bookings', '/calendar', '/collaborate',
    '/cqs', '/offers', '/payouts', '/edit-profile',
    '/testimonials'].some((p) => pathname.startsWith(p))

const isLearnerPath = (pathname: string) => pathname.startsWith('/learner')

const isOnboardingPath = (pathname: string) => pathname.startsWith('/onboarding')

const isProtectedPath = (pathname: string) =>
  isCreatorPath(pathname) || isLearnerPath(pathname) || isOnboardingPath(pathname)

// Better Auth session cookie. Prefixed `__Secure-` when served over HTTPS.
const hasSessionCookie = (request: NextRequest) =>
  request.cookies.has('better-auth.session_token') ||
  request.cookies.has('__Secure-better-auth.session_token')

function toSignIn(request: NextRequest) {
  const url = new URL('/sign-in', request.url)
  url.searchParams.set('redirect_url', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

/**
 * Edge middleware — coarse gating only. NO network requests, NO session fetch,
 * NO role validation. Real auth + RBAC happens in server layouts via the
 * guards in `lib/auth-guards.ts` (requireAuth / requireCreator / requireLearner).
 *
 * Responsibilities: public-vs-protected routing + session-cookie presence.
 * The pathname is forwarded as `x-pathname` so server guards can build an
 * accurate `redirect_url` for stale-session redirects.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  const next = () => NextResponse.next({ request: { headers: requestHeaders } })

  if (isPublicPath(pathname)) return next()
  if (!isProtectedPath(pathname)) return next()

  // Cookie present? Let it through — layouts validate the session for real.
  // Absent? No point rendering a protected layout that will only redirect.
  if (!hasSessionCookie(request)) return toSignIn(request)

  return next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
