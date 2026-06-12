import { redirect } from 'next/navigation'
import { getMe } from '@/dal/users.dal'
import CreatorSignUpForm from './_components/creator-sign-up-form'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function CreatorSignUpPage({ searchParams }: Props) {
  const user = await getMe()

  if (user) {
    // Already signed in — post-oauth handles role assignment + routing
    redirect('/api/post-oauth?intent=creator')
  }

  const { error } = await searchParams
  return <CreatorSignUpForm hasError={!!error} />
}
