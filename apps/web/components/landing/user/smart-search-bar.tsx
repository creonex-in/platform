'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const MOCK_NICHES = [
  { 
    id: 'design', 
    label: 'UI/UX Design', 
    count: '340+ creators', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>, 
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
  },
  { 
    id: 'engineering', 
    label: 'Engineering', 
    count: '890+ creators', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>, 
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
  },
  { 
    id: 'marketing', 
    label: 'Marketing', 
    count: '210+ creators', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>, 
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' 
  },
  { 
    id: 'product', 
    label: 'Product Management', 
    count: '150+ creators', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>, 
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20' 
  }
]

const MOCK_CREATORS = [
  { username: 'abhinav', name: 'Abhinav Chhikara', description: 'Product Design', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces&q=80' },
  { username: 'shweta', name: 'Shweta Singh', description: 'SWE at Google', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces&q=80' },
  { username: 'raj', name: 'Raj Vikramaditya', description: 'SDE at Amazon', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces&q=80' },
  { username: 'ishita', name: 'Ishita Sharma', description: 'Growth Marketing', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces&q=80' }
]

export default function SmartSearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false)
        setSelectedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter logic
  const filteredNiches = MOCK_NICHES.filter(n => n.label.toLowerCase().includes(query.toLowerCase()))
  const filteredCreators = MOCK_CREATORS.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.username.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
  )

  const slicedNiches = filteredNiches.slice(0, 4)
  const slicedCreators = filteredCreators.slice(0, 4)
  const combinedResults = [
    ...slicedNiches.map(n => ({ type: 'niche', href: `/top-creators/${n.id}` })),
    ...slicedCreators.map(c => ({ type: 'creator', href: `/${c.username}` }))
  ]

  const hasResults = combinedResults.length > 0
  const showDropdown = isFocused && query.length >= 0

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < combinedResults.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && combinedResults[selectedIndex]) {
        router.push(combinedResults[selectedIndex].href)
      } else if (combinedResults.length > 0) {
        // Default to first result if none selected but enter is pressed
        router.push(combinedResults[0].href)
      }
    }
  }

  return (
    <div ref={wrapperRef} className="u-hero-item relative z-50 mt-10 w-full max-w-2xl mx-auto">
      {/* Subtle Outer Glow */}
      <div className={`absolute -inset-1 bg-primary/20 blur-2xl rounded-[32px] transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* The Massive Pill Search Bar */}
      <div className={`relative flex items-center w-full h-16 sm:h-20 bg-card rounded-full shadow-[0_16px_60px_rgba(0,0,0,0.12)] border-[1.5px] transition-all duration-300 ${isFocused ? 'border-primary/50' : 'border-border/50 hover:border-border/80'}`}>
        
        {/* Search Icon */}
        <div className="pl-6 sm:pl-8 pr-3 flex items-center justify-center text-muted-foreground/60">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        
        {/* Input */}
        <input 
          type="text" 
          placeholder="Search for UI/UX, Engineering, or creators..." 
          className="flex-1 bg-transparent border-none focus:outline-none text-[15px] sm:text-[18px] font-medium text-foreground placeholder:text-muted-foreground/60 h-full w-full"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
        />
        
        {/* Inner Submit Button */}
        <div className="pr-2 sm:pr-3">
          <Button size="lg" className="h-12 sm:h-14 rounded-full px-6 sm:px-8 text-[14px] sm:text-[16px] font-bold shadow-md">
            Search
          </Button>
        </div>
      </div>

      {/* Live Dropdown */}
      <div 
        className={`absolute top-full left-0 right-0 mt-4 bg-card rounded-[24px] shadow-[0_20px_80px_rgba(0,0,0,0.15)] border border-border/50 p-2 transition-all duration-300 transform text-left overflow-y-auto overflow-x-hidden max-h-[320px] z-[60] ${showDropdown ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}
      >
        {hasResults ? (
          <>
            {filteredNiches.length > 0 && (
              <div className="p-4 border-b border-border/50">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3 px-2">
                  {query ? 'Matching Niches' : 'Popular Niches'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {slicedNiches.map((niche, idx) => {
                    const isSelected = selectedIndex === idx
                    return (
                      <Link key={niche.id} href={`/top-creators/${niche.id}`} className={`flex items-center gap-3 p-2.5 rounded-[16px] transition-colors ${isSelected ? 'bg-muted' : 'hover:bg-muted/80'}`}>
                        <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${niche.color}`}>
                          {niche.icon}
                        </div>
                        <div>
                          <div className="text-[15px] font-bold text-foreground">{niche.label}</div>
                          <div className="text-[12px] font-medium text-muted-foreground">{niche.count}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {filteredCreators.length > 0 && (
              <div className="p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3 px-2">
                  {query ? 'Matching Creators' : 'Top Creators'}
                </h4>
                <div className="flex flex-col gap-1">
                  {slicedCreators.map((creator, idx) => {
                    const isSelected = selectedIndex === slicedNiches.length + idx
                    return (
                      <Link key={creator.username} href={`/${creator.username}`} className={`flex items-center gap-3 p-2 rounded-[16px] transition-colors ${isSelected ? 'bg-muted' : 'hover:bg-muted/80'}`}>
                        <Image src={creator.image} alt={creator.name} width={40} height={40} className="rounded-full border border-border object-cover" />
                        <div className="flex-1">
                          <div className="text-[15px] font-bold text-foreground">{creator.name}</div>
                          <div className="text-[13px] font-medium text-muted-foreground">@{creator.username} • {creator.description}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <p className="text-[15px] font-bold text-foreground">No results found for &quot;{query}&quot;</p>
            <p className="text-[13px] font-medium text-muted-foreground mt-1">Try searching for UI/UX, Engineering, or a creator&apos;s name.</p>
          </div>
        )}
      </div>
    </div>
  )
}
