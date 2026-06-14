'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faCircleCheck, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/lib/toast'
import { testimonialsService } from '@/services/testimonials.service'
import { cn } from '@/lib/utils'

interface TestimonialFormProps {
  username: string
  creatorName: string
}

type FormState = 'idle' | 'submitting' | 'success'

export function TestimonialForm({ username, creatorName }: TestimonialFormProps): React.ReactElement {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [content, setContent] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [submittedName, setSubmittedName] = useState('')

  const MIN_CHARS = 20
  const contentValid = content.trim().length >= MIN_CHARS

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || rating === 0 || !contentValid) return

    setFormState('submitting')
    try {
      await testimonialsService.submit(username, {
        learnerName: name.trim(),
        learnerRole: role.trim() || undefined,
        content: content.trim(),
        rating,
      })
      setSubmittedName(name.trim())
      setFormState('success')
      toast.success('Review submitted!', 'Thank you for sharing your experience.')
    } catch {
      setFormState('idle')
      toast.error('Failed to submit', 'Please try again.')
    }
  }

  if (formState === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center py-4 space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
        >
          <FontAwesomeIcon
            icon={faCircleCheck}
            className="size-14 text-primary mx-auto"
          />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">
            Thanks, {submittedName}!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your review has been submitted. {creatorName} will be notified.
          </p>
        </div>
        <Link
          href={`/c/${username}`}
          className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
          Back to {creatorName}&apos;s profile
        </Link>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.form
        key="form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Star rating */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Your rating <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-1.5" onMouseLeave={() => setHovered(0)}>
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = star <= (hovered || rating)
              return (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHovered(star)}
                  onClick={() => setRating(star)}
                >
                  <FontAwesomeIcon
                    icon={filled ? faStar : faStarOutline}
                    className={cn(
                      'size-7 transition-colors',
                      filled ? 'text-amber-400' : 'text-muted-foreground/30',
                    )}
                  />
                </button>
              )
            })}
            {rating > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">
            Your name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ananya Sharma"
            required
          />
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-sm font-medium text-muted-foreground">
            Role / Title{' '}
            <span className="text-[11px] font-normal">(optional)</span>
          </Label>
          <Input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. UX Designer at Flipkart"
          />
        </div>

        {/* Review */}
        <div className="space-y-1.5">
          <Label htmlFor="content" className="text-sm font-medium">
            Your review <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Tell others what you gained from working with ${creatorName}...`}
              rows={4}
              className="resize-none pr-12"
            />
            <span
              className={cn(
                'absolute bottom-2 right-3 text-[10px] tabular-nums transition-colors',
                contentValid ? 'text-emerald-500' : 'text-muted-foreground/50',
              )}
            >
              {content.length}
            </span>
          </div>
          {content.length > 0 && !contentValid && (
            <p className="text-[11px] text-muted-foreground">
              {MIN_CHARS - content.trim().length} more characters needed
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={
            formState === 'submitting' || !name.trim() || rating === 0 || !contentValid
          }
        >
          {formState === 'submitting' ? 'Submitting…' : 'Submit review'}
        </Button>
      </motion.form>
    </AnimatePresence>
  )
}
