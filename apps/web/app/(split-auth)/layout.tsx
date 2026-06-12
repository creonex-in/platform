import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up — Creonex',
  description: 'Join Creonex today.',
}

export default function SplitAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {children}
    </main>
  )
}
