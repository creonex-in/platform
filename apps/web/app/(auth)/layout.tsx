import { redirect } from 'next/navigation'
import { getMe } from '@/dal/users.dal'
import { parseRoles } from '@creonex/types'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe()
  if (user) {
    const roles = parseRoles(user.role as string)
    redirect(roles.includes('creator') ? '/dashboard' : '/learner/dashboard')
  }
  return <>{children}</>
}
