'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons'

import { Button } from '@/components/ui/button'

export function BookSessionBar({ name }: { name: string }): React.ReactElement {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = (): void => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return <></>

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/95 backdrop-blur-sm border-t border-border/50 px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
      <div>
        <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{name}</p>
        <p className="text-[13px] font-semibold text-foreground leading-none">1:1 Session · ₹2,500</p>
      </div>
      <Button className="rounded-full px-5 py-2.5 text-[13px] font-semibold shrink-0">
        <FontAwesomeIcon icon={faCalendarCheck} className="size-3.5 mr-2" />
        Book Now
      </Button>
    </div>
  )
}
