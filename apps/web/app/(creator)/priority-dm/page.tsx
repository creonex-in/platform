'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/dashboard/shared/empty-state'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { mockPriorityDMs } from '@/data/mock-creator-tools'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

export default function PriorityDMPage(): React.ReactElement {
  const [tab, setTab] = useState('pending')
  const pending = mockPriorityDMs.filter((d) => !d.answered)
  const answered = mockPriorityDMs.filter((d) => d.answered)
  const list = tab === 'pending' ? pending : answered

  return (
    <>
      <DashboardTopbar
        title="Priority DM"
        action={
          <Button variant="outline" size="sm" className="text-xs">
            Edit service
          </Button>
        }
      />
      <div className="space-y-5 p-4 sm:p-6">
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium">Priority DM</p>
          <p className="text-xs text-muted-foreground">
            Accept paid DM requests and reply on your own time — without sharing your contact.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending {pending.length > 0 && `(${pending.length})`}
            </TabsTrigger>
            <TabsTrigger value="answered">
              Answered
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-2">
            {list.length === 0 ? (
              <EmptyState
                icon={faEnvelope}
                title={tab === 'pending' ? 'No pending DMs' : 'No answered DMs yet'}
                description="Paid DM requests from your audience will show up here."
              />
            ) : (
              list.map((dm, i) => (
                <motion.div
                  key={dm.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.04 }}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="bg-muted text-xs font-medium">
                      {dm.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{dm.name}</p>
                      <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                        {formatCurrency(dm.amount)}
                      </Badge>
                      <span className="ml-auto text-xs text-muted-foreground">{dm.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{dm.question}</p>
                    {!dm.answered && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          className="text-xs"
                          onClick={() => toast.success('Opening reply…')}
                        >
                          Answer
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
