import { type NextRequest, NextResponse } from 'next/server'
import { serverAuthClient } from '@/lib/auth-server-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

function onboardingStepUrl(currentStep: number, base: string): string {
  const stepMap: Record<number, string> = {
    1: '/onboarding/creator/step-1',
    2: '/onboarding/creator/step-2',
    3: '/onboarding/creator/step-3',
  }
  return new URL(stepMap[currentStep] ?? '/onboarding/creator/step-1', base).toString()
}

async function getCreatorProfile(cookieHeader: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/users/me/creator-profile`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json() as Promise<{ isLive: boolean; currentStep: number }>
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const intent = request.nextUrl.searchParams.get('intent')
  const sessionCookie = request.cookies.get('better-auth.session_token')

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const cookieHeader = `better-auth.session_token=${sessionCookie.value}`

  const { data: session } = await serverAuthClient.getSession({
    fetchOptions: {
      headers: { Cookie: cookieHeader },
      cache: 'no-store' as RequestCache,
    },
  })

  if (!session?.user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const roles = ((session.user as { role?: string }).role ?? '').split(',').filter(Boolean)
  const isCreator = roles.includes('creator')

  // ── Creator intent: assign role if needed, then route ────────────────────
  if (intent === 'creator') {
    if (!isCreator) {
      try {
        const res = await fetch(`${API_URL}/api/v1/users/me/add-creator-role`, {
          method: 'POST',
          headers: { Cookie: cookieHeader },
        })
        if (res.ok) {
          return NextResponse.redirect(new URL('/onboarding/creator/step-1', request.url))
        }
      } catch {
        // fall through to role-based routing
      }
      return NextResponse.redirect(new URL('/onboarding/creator/step-1', request.url))
    }

    // Already a creator — check onboarding status
    const profile = await getCreatorProfile(cookieHeader)
    if (!profile || !profile.isLive) {
      return NextResponse.redirect(
        new URL(onboardingStepUrl(profile?.currentStep ?? 1, request.url), request.url),
      )
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── No intent (sign-in via Google) — route by actual role ────────────────
  if (isCreator) {
    const profile = await getCreatorProfile(cookieHeader)
    if (!profile || !profile.isLive) {
      return NextResponse.redirect(
        new URL(onboardingStepUrl(profile?.currentStep ?? 1, request.url), request.url),
      )
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.redirect(new URL('/learner/dashboard', request.url))
}
