import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'urgency' | 'open' | 'new' | 'promo'

export interface OfferingCardType {
  id: string
  title: string
  category: string
  image: string
  price: number
  rating: number
  likes: number
  views: string
  badge?: string
  badgeVariant?: BadgeVariant
}

const badgeStyles: Record<BadgeVariant, string> = {
  urgency: 'bg-white/90 text-red-600 backdrop-blur-md',
  open: 'bg-white/90 text-emerald-600 backdrop-blur-md',
  new: 'bg-white/90 text-blue-600 backdrop-blur-md',
  promo: 'bg-white/90 text-amber-600 backdrop-blur-md',
}

export function OfferingCard({ item }: { item: OfferingCardType }): React.ReactElement {
  return (
    <div className="flex flex-col group cursor-pointer w-full">
      
      {/* Dribbble Style Image Container (No outer card borders) */}
      <div className="relative aspect-[4/3] w-full rounded-[16px] bg-muted overflow-hidden mb-3.5">
        <Image 
          src={item.image} 
          alt={item.title} 
          fill 
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" 
        />
        
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Minimal Floating Badge */}
        {item.badge && item.badgeVariant && (
          <div className="absolute top-3 left-3">
            <span className={cn('text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-black/5', badgeStyles[item.badgeVariant])}>
              {item.badge}
            </span>
          </div>
        )}
      </div>

      {/* Dribbble Style Footer (Unboxed, lightweight text) */}
      <div className="flex flex-col px-1">
        
        <div className="flex items-start justify-between gap-4 mb-1">
          {/* Title */}
          <h3 className="text-[15px] sm:text-[16px] font-bold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {/* Price */}
          <span className="font-extrabold text-[15px] text-foreground shrink-0 mt-0.5">
            ₹{item.price.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-[13px] text-muted-foreground font-medium">
          {/* Category */}
          <span className="truncate pr-4">
            {item.category}
          </span>
          
          {/* Rating */}
          {item.rating > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <FontAwesomeIcon icon={faStar} className="size-3 text-amber-500" />
              <span className="font-semibold text-foreground/80">{item.rating}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
