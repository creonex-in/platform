import { type NextRequest, NextResponse } from 'next/server'
import { serverAuthClient } from '@/lib/auth-server-client'

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

  // New user with creator intent — assign role then send to onboarding
  if (intent === 'creator' && !isCreator) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1/users/me/add-creator-role`,
        {
          method: 'POST',
          headers: { Cookie: cookieHeader },
        },
      )
      if (res.ok) {
        return NextResponse.redirect(new URL('/onboarding/creator/step-1', request.url))
      }
    } catch {
      // fall through to role-based routing on API error
    }
  }

  // Returning creator or just-assigned creator
  if (isCreator || intent === 'creator') {
    return NextResponse.redirect(new URL(isCreator ? '/dashboard' : '/onboarding/creator/step-1', request.url))
  }

  // Everyone else — learner dashboard
  return NextResponse.redirect(new URL('/learner/dashboard', request.url))
}
