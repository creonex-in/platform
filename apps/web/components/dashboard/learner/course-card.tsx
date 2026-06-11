'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faPlay, faClock, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Course } from '@/types/course'
import { formatCurrency, formatFollowers } from '@/lib/utils'

interface CourseCardProps {
  course: Course
  index?: number
}

export function CourseCard({ course, index = 0 }: CourseCardProps): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 6) * 0.04 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full bg-muted">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <Badge
          variant="secondary"
          className="absolute left-2 top-2 bg-background/90 px-2 text-[10px] font-medium backdrop-blur"
        >
          CQS {course.cqsScore}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="px-2 text-[10px] font-normal">
            {course.niche}
          </Badge>
          <Badge variant="outline" className="px-2 text-[10px] font-normal">
            {course.level}
          </Badge>
        </div>

        <p className="text-sm font-medium leading-snug">{course.title}</p>

        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="bg-muted text-[9px] font-medium">
              {course.expertInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{course.expertName}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faStar} className="size-3 text-amber-400" />
            {course.rating}
          </span>
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faUserGroup} className="size-3" />
            {formatFollowers(course.students)}
          </span>
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faPlay} className="size-3" />
            {course.lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faClock} className="size-3" />
            {course.durationHours}h
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="text-sm font-semibold">{formatCurrency(course.price)}</p>
            <p className="text-[10px] text-muted-foreground">one-time · lifetime access</p>
          </div>
          <Button size="sm">
            Enroll
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
