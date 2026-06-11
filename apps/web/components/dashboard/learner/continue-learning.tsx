import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { CourseProgress } from '@/types/resource'

interface ContinueLearningProps {
  course: CourseProgress
}

export function ContinueLearning({ course }: ContinueLearningProps): React.ReactElement {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40 sm:flex-row">
      <div className="relative aspect-[16/9] w-full bg-muted sm:aspect-auto sm:w-44 sm:shrink-0">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(max-width: 640px) 100vw, 176px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-base font-semibold leading-relaxed text-foreground">{course.title}</p>
            <p className="text-sm text-muted-foreground">By {course.expertName}</p>
          </div>
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            {course.progress}%
          </span>
        </div>

        <Progress value={course.progress} className="h-2" />

        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Next: <span className="text-foreground">{course.nextLesson}</span> · {course.nextLessonDuration}
        </p>

        <div className="mt-auto pt-2">
          <Button size="sm">
            <FontAwesomeIcon icon={faPlay} className="mr-1.5 size-3.5" />
            Resume
          </Button>
        </div>
      </div>
    </div>
  )
}
