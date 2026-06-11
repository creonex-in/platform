'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faBolt } from '@fortawesome/free-solid-svg-icons'
import { mockAutoDMRules, type AutoDMRule } from '@/data/mock-creator-tools'
import { toast } from 'sonner'

export default function AutoDMPage(): React.ReactElement {
  const [rules, setRules] = useState<AutoDMRule[]>(mockAutoDMRules)

  return (
    <>
      <DashboardTopbar
        title="Auto DM"
        action={
          <Button size="sm" className="text-xs" onClick={() => toast.success('New automation')}>
            <FontAwesomeIcon icon={faPlus} className="mr-1 size-3.5" />
            New rule
          </Button>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium">Auto DM</p>
          <p className="text-xs text-muted-foreground">
            Automatically reply to followers and comments to convert your audience on autopilot.
          </p>
        </div>

        <div className="space-y-3">
          {rules.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.04 }}
            >
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <FontAwesomeIcon icon={faBolt} className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">When: {rule.trigger}</p>
                      <Badge
                        variant={rule.active ? 'default' : 'outline'}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {rule.active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{rule.message}</p>
                  </div>
                  <Switch
                    checked={rule.active}
                    onCheckedChange={(v) => {
                      setRules((prev) =>
                        prev.map((r) => (r.id === rule.id ? { ...r, active: v } : r))
                      )
                      toast.success(v ? 'Automation activated' : 'Automation paused')
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}
