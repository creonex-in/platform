import { redirect } from 'next/navigation'

// OAuth callback is now handled by /sign-in/redirect
export default function SignUpCallbackPage() {
  redirect('/sign-in/redirect')
}
