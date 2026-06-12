import { NextResponse, type NextRequest } from 'next/server'
import { serverAuthClient } from '@/lib/auth-server-client'

const isPublicPath = (pathname: string) =>
  pathname === '/' ||
  pathname === '/creators' ||
  pathname.startsWith('/top-creators') ||
  pathname.startsWith('/sign-in') ||
  pathname.startsWith('/sign-up') || // covers /sign-up, /sign-up/learner, /sign-up/creator
  pathname.startsWith('/api/')

const isCreatorPath = (pathname: string) =>
  ['/dashboard', '/analytics', '/bookings', '/calendar', '/collaborate',
    '/cqs', '/offers', '/payouts', '/edit-profile', '/auto-dm',
    '/priority-dm', '/testimonials'].some((p) => pathname.startsWith(p))

const isLearnerPath = (pathname: string) => pathname.startsWith('/learner')

const isOnboardingPath = (pathname: string) => pathname.startsWith('/onboarding')

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) return NextResponse.next()

  if (!isCreatorPath(pathname) && !isLearnerPath(pathname) && !isOnboardingPath(pathname)) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('better-auth.session_token')

  if (!sessionCookie) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  let role = 'learner'

  try {
    const { data: session } = await serverAuthClient.getSession({
      fetchOptions: {
        headers: { Cookie: `better-auth.session_token=${sessionCookie.value}` },
        cache: 'no-store' as RequestCache,
      },
    })
    if (session?.user?.role) role = session.user.role
  } catch {
    return NextResponse.next()
  }

  const roles = role.split(',')
  const isCreator = roles.includes('creator')
  const isLearner = roles.includes('learner')

  // ── Onboarding — session existence already checked above ─────────────────
  // Role enforcement happens at NestJS API level; proxy only guards session presence
  if (isOnboardingPath(pathname)) return NextResponse.next()

  // ── Creator routes ────────────────────────────────────────────────────────
  if (isCreatorPath(pathname)) {
    if (!isCreator) return NextResponse.redirect(new URL('/learner/dashboard', request.url))
    return NextResponse.next()
  }

  // ── Learner routes ────────────────────────────────────────────────────────
  if (isLearnerPath(pathname)) {
    if (!isLearner) return NextResponse.redirect(new URL('/sign-in', request.url))
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
