'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignInForm = z.infer<typeof signInSchema>

function isSafeRedirect(path: string | null): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//')
}

function mapAuthError(error: { message?: string; status?: number; code?: string }): string {
  switch (error.code) {
    case 'INVALID_EMAIL_OR_PASSWORD': return 'Incorrect email or password.'
    case 'USER_NOT_FOUND': return 'No account found with this email.'
    case 'EMAIL_NOT_VERIFIED': return 'Please verify your email before signing in.'
    case 'USER_BANNED': return 'This account has been suspended.'
  }
  if (error.status === 429) return 'Too many attempts. Wait a moment and try again.'
  if (error.status === 500) return 'Server error. Please try again in a moment.'
  if (error.message?.toLowerCase().includes('not found')) return 'No account found with this email.'
  return error.message ?? 'Something went wrong. Please try again.'
}

export function SignInForm(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [noAccount, setNoAccount] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    mode: 'onSubmit',
  })

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setServerError(null)
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${process.env.NEXT_PUBLIC_WEB_URL}/api/post-oauth`,
      })
      if (error) {
        setServerError(mapAuthError(error))
        setGoogleLoading(false)
      }
      // on success: browser redirects — don't reset loading
    } catch {
      setServerError('Unable to connect. Check your internet and try again.')
      setGoogleLoading(false)
    }
  }

  async function onSubmit(values: SignInForm) {
    setServerError(null)
    setNoAccount(false)

    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })

      if (error) {
        const isNotFound = error.code === 'USER_NOT_FOUND' || error.status === 404
        setNoAccount(isNotFound)
        setServerError(mapAuthError(error))
        return
      }

      if (!data) {
        setServerError('Something went wrong. Please try again.')
        return
      }

      if (isSafeRedirect(redirectUrl)) {
        router.push(redirectUrl)
        return
      }

      const { data: session } = await authClient.getSession()
      const roles = (session?.user?.role as string | undefined)?.split(',') ?? []

      router.push(roles.includes('creator') ? '/dashboard' : '/learner/dashboard')
    } catch {
      setServerError('Unable to connect. Check your internet and try again.')
    }
  }

  const isLoading = isSubmitting || googleLoading

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your Creonex account to continue
        </p>
      </div>

      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        variant="outline"
        className="h-12 w-full gap-3 rounded-xl border-border bg-background/50 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 hover:text-foreground shadow-sm"
      >
        <GoogleIcon />
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background/80 backdrop-blur-md px-3 py-1 font-medium text-muted-foreground rounded-full border border-border/50">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isLoading}
              {...register('email')}
              className="h-12 rounded-xl border-border bg-background/50 px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/50"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              {...register('password')}
              className="h-12 rounded-xl border-border bg-background/50 px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/50"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
        </div>

        {serverError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {serverError}
            {noAccount && (
              <>
                {' '}
                <Link href="/sign-up" className="underline font-medium hover:text-destructive/80">
                  Sign up instead?
                </Link>
              </>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:bg-primary/90 hover:scale-[0.98] active:scale-[0.95]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/sign-up"
          className="font-medium text-foreground transition-colors hover:text-primary hover:underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}
