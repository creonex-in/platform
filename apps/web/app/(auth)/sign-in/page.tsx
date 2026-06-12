import type { Metadata } from 'next'
import { SignInForm } from './_components/sign-in-form'

export const metadata: Metadata = {
  title: 'Sign In — Creonex',
  description: 'Sign in to your Creonex account.',
}

export default function SignInPage(): React.ReactElement {
  return <SignInForm />
}
