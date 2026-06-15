import type { UserRole } from './roles'
import type { Niche, GoalType, SocialLinks } from './onboarding'

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  roles: UserRole[]
  onboardingComplete: boolean
  image?: string | null
}

export interface SessionResponse {
  user: AuthUser
  session: {
    id: string
    expiresAt: string
  }
}

// ── User ─────────────────────────────────────────────────────────────────────

/** Shape returned by GET /api/v1/users/me */
export interface UserContext {
  id: string
  email: string
  name: string
  /** Comma-separated roles: "learner" | "learner,creator" */
  role: string
  image: string | null
}

// ── Creator Profile ───────────────────────────────────────────────────────────

/** Shape returned by GET /api/v1/users/me/creator-profile */
export interface CreatorProfile {
  id: string
  userId: string
  username: string | null
  displayName: string | null
  bio: string | null
  profilePhotoUrl: string | null
  coverBannerUrl: string | null
  primaryNiche: Niche | null
  experienceYears: number | null
  socialLinks: SocialLinks | null
  languages: string[]
  tags: string[]
  qualityScore: string
  qualityTier: string
  isLive: boolean
  inDiscoveryBoost: boolean
  boostEndDate: string | null
  onboardingStatus: string
  currentStep: number
}

// ── Learner Profile ───────────────────────────────────────────────────────────

/** Shape returned by GET /api/v1/users/me/learner-profile */
export interface LearnerProfile {
  id: string
  userId: string
  goalType: GoalType | null
  interestedNiches: string[]
  onboardingStatus: string
}

// ── Role Mutation ─────────────────────────────────────────────────────────────

export interface AddCreatorRoleResponse {
  success: boolean
  roles: UserRole[]
  redirectTo: string
  alreadyCreator?: boolean
}

// ── Public Creator Profile ────────────────────────────────────────────────────

export type { SocialLinks }

export interface PublicOffering {
  id: string
  type: string
  title: string
  description: string | null
  price: number
  currency: string
  durationMinutes: number | null
  seatsTotal: number | null
  seatsRemaining: number | null
  status: string
  totalBookings: number
  thumbnailUrl: string | null
}

// ── Creator-owned Offering (full shape, owner dashboard) ──────────────────────

export interface CreatorOffering {
  id: string
  type: string
  title: string
  description: string | null
  /** Price in whole INR (rupees), already divided from paise by the API */
  price: number
  currency: string
  durationMinutes: number | null
  seatsTotal: number | null
  seatsRemaining: number | null
  status: string
  totalBookings: number
  totalRevenuePaise: number
  thumbnailUrl: string | null
  minNoticeMinutes: number | null
  bookingWindowDays: number | null
  bufferAfterMinutes: number | null
  scheduleId: string | null
  slug: string | null
  createdAt: string
  updatedAt: string
}

// ── Creator profile update (post-onboarding edit) ─────────────────────────────

/** Partial update for the creator's own profile. Only provided fields are written. */
export interface UpdateCreatorProfileRequest {
  displayName?: string
  username?: string
  bio?: string
  profilePhotoUrl?: string | null
  coverBannerUrl?: string | null
  primaryNiche?: string
  experienceYears?: number | null
  socialLinks?: SocialLinks
  languages?: string[]
  tags?: string[]
}

// ── Offer creation eligibility (type gating) ──────────────────────────────────

export interface OfferCreationEligibility {
  /** 1:1 sessions the creator has already delivered. */
  completedOneOnOneSessions: number
  /** Sessions required to unlock the gated offer types. */
  requiredSessions: number
  /** True once the creator may create gated types (group / workshop). */
  unlocked: boolean
  /** Offer types still locked for this creator. */
  lockedTypes: string[]
}

/** Aggregate offer stats for the creator's /offers dashboard (server-computed). */
export interface CreatorOfferStats {
  totalOffers: number
  liveOffers: number
  /** Confirmed + completed bookings across all offerings (net of cancellations). */
  totalBookings: number
  /** Gross revenue in whole INR from confirmed + completed bookings. */
  totalRevenue: number
}

// ── Booking Flow ──────────────────────────────────────────────────────────────

export interface CreateBookingRequest {
  offeringId: string
  startTime?: string
  endTime?: string
  topic?: string
  learnerTimezone?: string
}

export interface CreateGuestBookingRequest extends CreateBookingRequest {
  guestName: string
  guestEmail: string
  guestPhone?: string
}

export interface ConfirmBookingRequest {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface BookingCreatedResponse {
  bookingId: string
  razorpayOrderId: string
  amountPaise: number
  currency: string
  razorpayKeyId: string
}

export interface BookingConfirmedResponse {
  id: string
  status: string
  meetingUrl: string | null
}

export interface PublicTestimonial {
  id: string
  learnerName: string
  learnerRole: string | null
  content: string
  rating: number
}

export interface PublicCreatorProfile {
  id: string
  username: string
  displayName: string | null
  bio: string | null
  profilePhotoUrl: string | null
  coverBannerUrl: string | null
  primaryNiche: string | null
  experienceYears: number | null
  languages: string[]
  socialLinks: SocialLinks
  qualityTier: string
  smoothedRating: string
  totalReviews: number
  totalSessions: number
  isVerified: boolean
  tags: string[]
  email: string
  offerings: PublicOffering[]
  testimonials: PublicTestimonial[]
}

// ── Creator Bookings ──────────────────────────────────────────────────────────

export type CreatorBookingStatus = 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'

export interface CreatorBookingItem {
  id: string
  offeringId: string
  offeringTitle: string
  offeringType: string
  learnerProfileId: string
  learnerName: string
  startTime: string | null
  endTime: string | null
  status: CreatorBookingStatus
  amountPaise: number
  topic: string | null
  meetingUrl: string | null
  cancelledAt: string | null
  createdAt: string
}

export interface CreatorTestimonialItem {
  id: string
  learnerName: string
  learnerRole: string | null
  content: string
  rating: number
  isPublic: boolean
  createdAt: string
}

// ── Onboarding Responses ──────────────────────────────────────────────────────

export interface OnboardingStepResponse {
  success: boolean
  nextStep?: number
  redirectTo?: string
}

export interface UsernameCheckResponse {
  available: boolean
  reason?: string
}

export interface GoLiveResponse {
  success: boolean
  username: string
  profileUrl: string
  offeringId?: string
  redirectTo: string
}
