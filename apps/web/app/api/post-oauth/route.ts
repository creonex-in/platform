import { type NextRequest, NextResponse } from 'next/server'
import { parseRoles } from '@creonex/types'
import { serverAuthClient } from '@/lib/auth-server-client'
import { userService } from '@/services/user.service'

function onboardingStepUrl(currentStep: number, base: string): string {
  const stepMap: Record<number, string> = {
    1: '/onboarding/creator/step-1',
    2: '/onboarding/creator/step-2',
    3: '/onboarding/creator/step-3',
  }
  return new URL(stepMap[currentStep] ?? '/onboarding/creator/step-1', base).toString()
}

async function routeExistingCreator(cookieHeader: string, request: NextRequest): Promise<NextResponse> {
  try {
    const profile = await userService.getCreatorProfile(cookieHeader)
    if (!profile.isLive) {
      return NextResponse.redirect(new URL(onboardingStepUrl(profile.currentStep, request.url), request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/onboarding/creator/step-1', request.url))
  }
  return NextResponse.redirect(new URL('/creator', request.url))
}

export async function GET(request: NextRequest) {
  const intent = request.nextUrl.searchParams.get('intent')

  // Forward the full cookie header — never reconstruct a single cookie
  // (would drop the `__Secure-` prefix + any other Better Auth cookies).
  const cookieHeader = request.headers.get('cookie') ?? ''
  if (!cookieHeader) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const { data: session } = await serverAuthClient.getSession({
    fetchOptions: {
      headers: { Cookie: cookieHeader },
      cache: 'no-store' as RequestCache,
    },
  })

  if (!session?.user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const isCreator = parseRoles((session.user as { role?: string }).role ?? '').includes('creator')

  if (intent === 'creator') {
    if (!isCreator) {
      try {
        await userService
          .addCreatorRole(cookieHeader)
      } catch {
        return NextResponse.redirect(new URL('/sign-up/creator?error=1', request.url))
      }
      return NextResponse.redirect(new URL('/onboarding/creator/step-1', request.url))
    }
    return routeExistingCreator(cookieHeader, request)
  }

  // No intent (plain Google sign-in) — route by role
  if (isCreator) {
    return routeExistingCreator(cookieHeader, request)
  }

  return NextResponse.redirect(new URL('/', request.url))
}
