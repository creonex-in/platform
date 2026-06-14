import CreatorSignUpForm from './_components/creator-sign-up-form'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function CreatorSignUpPage({ searchParams }: Props) {
  const { error } = await searchParams
  return <CreatorSignUpForm hasError={!!error} />
}
