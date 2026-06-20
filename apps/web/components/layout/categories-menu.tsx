'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faLaptopCode, 
  faChartLine, 
  faPenNib, 
  faCameraRetro, 
  faDumbbell, 
  faMusic 
} from '@fortawesome/free-solid-svg-icons'

const categories = [
  {
    title: 'Development',
    href: '/explore?niche=development',
    description: 'Learn coding, web dev, and software engineering.',
    icon: faLaptopCode,
  },
  {
    title: 'Business',
    href: '/explore?niche=business',
    description: 'Master management, finance, and entrepreneurship.',
    icon: faChartLine,
  },
  {
    title: 'Design',
    href: '/explore?niche=design',
    description: 'UI/UX, graphic design, and 3D modeling skills.',
    icon: faPenNib,
  },
  {
    title: 'Photography',
    href: '/explore?niche=photography',
    description: 'Camera basics, portrait photography, and editing.',
    icon: faCameraRetro,
  },
  {
    title: 'Health & Fitness',
    href: '/explore?niche=health',
    description: 'Workout plans, nutrition, and wellness guides.',
    icon: faDumbbell,
  },
  {
    title: 'Music & Audio',
    href: '/explore?niche=music',
    description: 'Production, instruments, and vocal training.',
    icon: faMusic,
  },
]

export function CategoriesMenu() {
  return (
    <NavigationMenu className="hidden lg:flex z-50">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-[15px] font-medium text-muted-foreground hover:text-foreground h-auto p-0 px-2 ml-4 transition-colors">
            Categories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="flex w-[600px] p-4 md:w-[700px] lg:w-[850px] bg-background">
              {/* Left Side: Featured Topic */}
              <div className="w-1/3 bg-foreground p-6 rounded-xl flex flex-col justify-end relative overflow-hidden group border border-border/50 mr-4 min-h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <div className="relative z-20 mt-auto">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Featured Path</div>
                  <h3 className="text-xl font-bold mb-2 text-background">Full-Stack Development</h3>
                  <p className="text-sm text-background/80 mb-4">
                    From beginner to advanced. Master React, Node, and modern web architectures.
                  </p>
                  <Link
                    href="/explore?niche=development"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-background/90"
                  >
                    Start Learning
                  </Link>
                </div>
              </div>

              {/* Right Side: Grid of Categories */}
              <div className="w-2/3 grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.title}
                    href={category.href}
                    className="group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                        <FontAwesomeIcon icon={category.icon} className="size-4" />
                      </div>
                      <div className="text-sm font-bold leading-none">{category.title}</div>
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground ml-12">
                      {category.description}
                    </p>
                  </Link>
                ))}
                
                {/* View All */}
                <div className="col-span-2 mt-2 pt-3 border-t border-border/60 text-center">
                  <Link href="/explore" className="text-sm font-bold text-foreground hover:underline">
                    Browse all categories &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
