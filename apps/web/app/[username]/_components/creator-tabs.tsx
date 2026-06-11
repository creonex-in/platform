'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { OfferingCard, OfferingCardType } from './offering-card'

interface CreatorTabsProps {
  sessions: OfferingCardType[]
  courses: OfferingCardType[]
  groups: OfferingCardType[]
}

export function CreatorTabs({ sessions, courses, groups }: CreatorTabsProps) {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { value: 'all', label: 'All Services', count: courses.length + sessions.length + groups.length },
    { value: 'sessions', label: '1:1 Calls', count: sessions.length },
    { value: 'courses', label: 'Digital Products', count: courses.length },
    { value: 'groups', label: 'Communities', count: groups.length },
  ]

  const getAllItems = () => {
    switch (activeTab) {
      case 'sessions': return sessions
      case 'courses': return courses
      case 'groups': return groups
      default: return [...sessions, ...courses, ...groups]
    }
  }

  return (
    <div className="mt-6">
      <div className="px-5 sm:px-10 overflow-x-auto no-scrollbar pb-2">
        <div className="h-10 gap-2 bg-muted/50 p-1 justify-start min-w-max flex rounded-xl relative">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'relative rounded-lg px-4 text-[13px] font-bold transition-all flex-none z-10',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-background rounded-lg shadow-sm"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-20 flex items-center gap-1">
                  {tab.label}
                  {tab.count > 0 && (
                    <sup className="text-[10px] font-semibold opacity-70 mt-1.5">{tab.count}</sup>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-background pt-8 pb-12 mt-0 px-5 sm:px-10 min-h-[400px]">
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          <AnimatePresence mode="popLayout">
            {getAllItems().map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <OfferingCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
