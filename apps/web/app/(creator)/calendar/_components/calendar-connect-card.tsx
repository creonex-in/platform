'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarCheck,
  faCircleCheck,
  faVideo,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { endpoints } from '@/lib/endpoints'
import { calendarService, type CalendarStatus } from '@/services/calendar.service'

const BENEFITS = [
  { icon: faCircleCheck, text: 'No double-bookings with existing events' },
  { icon: faVideo, text: 'Auto Google Meet link per booking' },
  { icon: faShieldHalved, text: 'Real-time freebusy sync' },
]

interface Props {
  initialStatus: CalendarStatus
}

const GOOGLE_CONNECT_LINK = process.env.NEXT_PUBLIC_API_URL! + endpoints.calendar.connect

export function CalendarConnectCard({ initialStatus }: Props) {
  const [status, setStatus] = useState<CalendarStatus>(initialStatus)
  const [disconnecting, setDisconnecting] = useState(false)

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      await calendarService.disconnect()
      setStatus({ connected: false })
      toast.success('Google Calendar disconnected')
    } catch {
      toast.error('Failed to disconnect. Please try again.')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarCheck} className="size-3.5 text-primary" />
            Google Calendar
          </CardTitle>
          {status.connected && (
            <Badge variant="secondary" className="text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border-0">
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {status.connected ? (
          <>
            <p className="text-xs text-muted-foreground truncate">
              {status.accountEmail}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? (
                <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1.5" />
              ) : null}
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <ul className="space-y-2">
              {BENEFITS.map((b) => (
                <li key={b.text} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <FontAwesomeIcon icon={b.icon} className="size-3 mt-0.5 shrink-0 text-primary/60" />
                  {b.text}
                </li>
              ))}
            </ul>
            <Link
              href={GOOGLE_CONNECT_LINK}
              className="inline-flex w-full h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            >
              Connect Google Calendar
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}