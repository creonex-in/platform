'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { parseRoles } from '@creonex/types'

export function LearnerDashboardButton(): React.ReactElement | null {
  const { data: session } = authClient.useSession()

  if (!session?.user?.role) return null

  const roles = parseRoles(session.user.role)
  if (roles.includes('creator')) return null

  return (
    <Link href="/learner/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
      My Learning
    </Link>
  )
}
