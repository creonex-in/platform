import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OfferingCard } from './offering-card'
import { getTypeConfig } from './types'
import type { PublicOffering } from '@creonex/types'

interface OfferingsSectionProps {
  offerings: PublicOffering[]
  activeTabs: [string, PublicOffering[]][]
  showAllTab: boolean
  defaultTab: string
}

export function OfferingsSection({
  offerings,
  activeTabs,
  showAllTab,
  defaultTab,
}: OfferingsSectionProps): React.ReactElement | null {
  if (activeTabs.length === 0) return null

  return (
    <div id="offerings" className="w-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground font-display">
          Available Services ({offerings.length})
        </h3>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          Select a session or product below to proceed.
        </p>
      </div>

        <Tabs defaultValue={defaultTab}>
          {activeTabs.length > 1 && (
            <div className="overflow-x-auto scrollbar-hide mb-8">
              <TabsList className="h-auto gap-2 bg-muted/50 dark:bg-muted/30 p-1 justify-start flex rounded-full w-fit max-w-full">
                {showAllTab && (
                  <TabsTrigger
                    value="all"
                    className="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-muted-foreground data-[state=active]:text-background dark:data-[state=active]:text-foreground data-[state=active]:bg-foreground dark:data-[state=active]:bg-background transition-all cursor-pointer whitespace-nowrap"
                  >
                    All
                    <span className="ml-1.5 text-[10px] opacity-75 font-semibold">({offerings.length})</span>
                  </TabsTrigger>
                )}
                {activeTabs.map(([type, items]) => {
                  const cfg = getTypeConfig(type)
                  return (
                    <TabsTrigger
                      key={type}
                      value={type}
                      className="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-muted-foreground data-[state=active]:text-background dark:data-[state=active]:text-foreground data-[state=active]:bg-foreground dark:data-[state=active]:bg-background transition-all cursor-pointer whitespace-nowrap"
                    >
                      {cfg.tabLabel}
                      <span className="ml-1.5 text-[10px] opacity-75 font-semibold">({items.length})</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>
          )}

          <div>
            {showAllTab && (
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offerings.map((item) => <OfferingCard key={item.id} item={item} />)}
                </div>
              </TabsContent>
            )}
            {activeTabs.map(([type, items]) => (
              <TabsContent key={type} value={type} className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => <OfferingCard key={item.id} item={item} />)}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
    </div>
  )
}
