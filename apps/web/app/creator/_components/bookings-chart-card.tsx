'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import type { BookingsTrendPoint } from '@creonex/types'

const chartConfig: ChartConfig = {
  count: {
    label: 'Bookings',
    color: 'var(--primary)',
  },
}

interface Props {
  data: BookingsTrendPoint[]
}

export function BookingsChartCard({ data }: Props) {
  const empty = data.length === 0

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FontAwesomeIcon icon={faChartLine} className="size-4 text-primary" />
          Bookings trend
          <span className="ml-auto text-xs font-normal text-muted-foreground">last 30 days</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No bookings data yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <LineChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(val) => [val, 'Bookings']}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
