import { DiscoveryHeader } from '@/components/layout/discovery-header'

import Footer from '@/components/layout/footer'

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DiscoveryHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

