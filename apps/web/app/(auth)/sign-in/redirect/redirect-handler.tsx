'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { userService } from '@/services/user.service'

export function RedirectHandler(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function route() {
      const { data: session } = await authClient.getSession()

      if (!session?.user) {
        router.replace('/sign-in')
        return
      }

      const intent = searchParams.get('intent')
      const roles = (session.user.role as string | undefined)?.split(',') ?? ['learner']
      const isCreator = roles.includes('creator')

      if (intent === 'creator' && !isCreator) {
        try {
          const result = await userService.addCreatorRole()
          router.replace(result.redirectTo)
        } catch {
          router.replace('/onboarding/creator/step-1')
        }
        return
      }

      if (intent === 'learner') {
        router.replace('/onboarding/learner/step-1')
        return
      }

      // Returning user — route by role
      if (isCreator) {
        router.replace('/dashboard')
      } else {
        router.replace('/learner/dashboard')
      }
    }

    route()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Setting up your account…</p>
      </div>
    </div>
  )
}
