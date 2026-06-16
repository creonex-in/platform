'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar } from '@fortawesome/free-solid-svg-icons'
import type { EarningsTrendPoint } from '@creonex/types'

const chartConfig: ChartConfig = {
  earningsPaise: {
    label: 'Earnings',
    color: 'var(--primary)',
  },
}

interface Props {
  data: EarningsTrendPoint[]
}

export function EarningsChartCard({ data }: Props) {
  const empty = data.length === 0

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FontAwesomeIcon icon={faChartBar} className="size-4 text-primary" />
          Weekly earnings
          <span className="ml-auto text-xs font-normal text-muted-foreground">last 8 weeks</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No earnings data yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(v: number) => `₹${(v / 100000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(val) => [`₹${Math.round(Number(val) / 100).toLocaleString('en-IN')}`, 'Earnings']}
                  />
                }
              />
              <Bar dataKey="earningsPaise" fill="var(--color-earningsPaise)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
