'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons'

export function BookSessionBar({
  name,
  price,
  onBook,
}: {
  name: string
  price: number | null
  onBook?: () => void
}): React.ReactElement {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = (): void => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return <></>

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t border-gray-150/80 px-5 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div>
        <p className="text-xs text-muted-foreground font-semibold leading-none mb-1">{name}</p>
        <p className="text-sm font-extrabold text-foreground leading-none">
          1:1 Session{price != null ? ` · ₹${price.toLocaleString('en-IN')}` : ''}
        </p>
      </div>
      <button
        onClick={onBook ?? (() => { document.querySelector('#offerings')?.scrollIntoView({ behavior: 'smooth' }) })}
        className="bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
      >
        <FontAwesomeIcon icon={faCalendarCheck} className="size-3" />
        Book Now
      </button>
    </div>
  )
}
