'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse, faCalendarDays, faBookOpen, faSeedling, faUser, faCompass,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command'

/** Dispatch this anywhere (header trigger) to open the palette. */
export const OPEN_COMMAND_EVENT = 'learner:open-command'
export function openCommandPalette(): void {
  window.dispatchEvent(new Event(OPEN_COMMAND_EVENT))
}

const NAV: { label: string; href: string; icon: IconDefinition }[] = [
  { label: 'Home', href: '/learner', icon: faHouse },
  { label: 'Schedule', href: '/learner/schedule', icon: faCalendarDays },
  { label: 'Library', href: '/learner/library', icon: faBookOpen },
  { label: 'Growth', href: '/learner/growth', icon: faSeedling },
  { label: 'Account', href: '/learner/account', icon: faUser },
]

export function CommandPalette(): React.ReactElement {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_COMMAND_EVENT, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpen)
    }
  }, [])

  const go = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command palette" description="Jump anywhere">
      <CommandInput placeholder="Jump to a section or search…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Go to">
          {NAV.map((n) => (
            <CommandItem key={n.href} value={n.label} onSelect={() => go(n.href)}>
              <FontAwesomeIcon icon={n.icon} className="size-3.5 text-muted-foreground" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Discover">
          <CommandItem value="explore creators" onSelect={() => go('/explore')}>
            <FontAwesomeIcon icon={faCompass} className="size-3.5 text-muted-foreground" />
            Explore creators
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
