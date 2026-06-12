'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { parseRoles } from '@creonex/types'

export function CreatorDashboardButton(): React.ReactElement | null {
  const { data: session } = authClient.useSession()

  if (!session?.user?.role) return null

  console.log(session);

  const roles = parseRoles(session.user.role)
  if (!roles.includes('creator')) return null

  return (
    <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
      Creator Dashboard
    </Link>
  )
}
