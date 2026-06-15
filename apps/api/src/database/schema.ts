import { sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  pgEnum,
  decimal,
  date,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import {
  NICHES,
  GOAL_TYPES,
  OFFER_TYPES,
  OFFER_STATUSES,
  KYC_STATUSES,
  ONBOARDING_STATUSES,
  BOOKING_STATUSES,
  OVERRIDE_TYPES,
} from '@creonex/types'

// ============================================================
// BETTER AUTH TABLES
// ============================================================

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  // Comma-separated roles: "learner" | "learner,creator" | "admin"
  role: text('role').notNull().default('learner'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull().$onUpdateFn(() => new Date()),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull().$onUpdateFn(() => new Date()),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

// ============================================================
// ENUMS
// ============================================================

export const goalTypeEnum = pgEnum('goal_type', [...GOAL_TYPES] as [string, ...string[]])
export const nicheEnum = pgEnum('niche', [...NICHES] as [string, ...string[]])
export const offerTypeEnum = pgEnum('offer_type', [...OFFER_TYPES] as [string, ...string[]])
export const offerStatusEnum = pgEnum('offer_status', [...OFFER_STATUSES] as [string, ...string[]])
export const kycStatusEnum = pgEnum('kyc_status', [...KYC_STATUSES] as [string, ...string[]])
export const onboardingStatusEnum = pgEnum('onboarding_status', [...ONBOARDING_STATUSES] as [string, ...string[]])
export const bookingStatusEnum = pgEnum('booking_status', [...BOOKING_STATUSES] as [string, ...string[]])
export const overrideTypeEnum = pgEnum('override_type', [...OVERRIDE_TYPES] as [string, ...string[]])

// ============================================================
// LEARNER PROFILES
// ============================================================

export const learnerProfiles = pgTable('learner_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  goalType: goalTypeEnum('goal_type'),
  interestedNiches: jsonb('interested_niches')
    .$type<string[]>()
    .default([])
    .notNull(),
  onboardingStatus: onboardingStatusEnum('onboarding_status')
    .default('not_started')
    .notNull(),
  currentStep: integer('current_step').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
})

// ============================================================
// CREATOR PROFILES
// ============================================================

export const creatorProfiles = pgTable(
  'creator_profiles',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
    username: text('username').unique(),
    displayName: text('display_name'),
    bio: text('bio'),
    profilePhotoUrl: text('profile_photo_url'),
    coverBannerUrl: text('cover_banner_url'),
    primaryNiche: nicheEnum('primary_niche'),
    experienceYears: integer('experience_years'),
    qualityScore: decimal('quality_score', { precision: 6, scale: 4 })
      .default('0')
      .notNull(),
    qualityTier: text('quality_tier').default('new').notNull(),
    smoothedRating: decimal('smoothed_rating', { precision: 4, scale: 2 })
      .default('0')
      .notNull(),
    totalReviews: integer('total_reviews').default(0).notNull(),
    totalSessions: integer('total_sessions').default(0).notNull(),
    inDiscoveryBoost: boolean('in_discovery_boost').default(false).notNull(),
    boostEndDate: timestamp('boost_end_date'),
    isLive: boolean('is_live').default(false).notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    kycStatus: kycStatusEnum('kyc_status').default('not_started').notNull(),
    socialLinks: jsonb('social_links')
      .$type<{
        youtube?: string
        linkedin?: string
        instagram?: string
        twitter?: string
        website?: string
      }>()
      .default({}),
    languages: jsonb('languages')
      .$type<string[]>()
      .default(['English'])
      .notNull(),
    onboardingStatus: onboardingStatusEnum('onboarding_status')
      .default('not_started')
      .notNull(),
    currentStep: integer('current_step').default(1).notNull(),
    // Creator discovery answers (onboarding questions)
    credentialType: text('credential_type'),
    audienceType: text('audience_type'),
    primaryPlatform: text('primary_platform'),
    creatorGoal: text('creator_goal'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
  },
  (t) => ({
    qualityIdx: index('idx_creator_profiles_quality').on(t.qualityScore.desc()),
    nicheIdx: index('idx_creator_profiles_niche').on(t.primaryNiche),
    liveIdx: index('idx_creator_profiles_live').on(t.isLive),
  }),
)

export const creatorTags = pgTable(
  'creator_tags',
  {
    id: text('id').primaryKey(),
    creatorProfileId: text('creator_profile_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    tag: text('tag').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    tagIdx: index('idx_creator_tags_tag').on(t.tag),
    creatorIdx: index('idx_creator_tags_creator').on(t.creatorProfileId),
  }),
)

// ============================================================
// OFFERINGS
// ============================================================

export const offerings = pgTable(
  'offerings',
  {
    id: text('id').primaryKey(),
    creatorProfileId: text('creator_profile_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    type: offerTypeEnum('type').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    currency: text('currency').default('INR').notNull(),
    durationMinutes: integer('duration_minutes'),
    scheduledAt: timestamp('scheduled_at'),
    seatsTotal: integer('seats_total'),
    seatsRemaining: integer('seats_remaining'),
    status: offerStatusEnum('status').default('draft').notNull(),
    totalBookings: integer('total_bookings').default(0).notNull(),
    totalRevenuePaise: integer('total_revenue_paise').default(0).notNull(),
    thumbnailUrl: text('thumbnail_url'),
    // Scheduling (one_on_one): reusable availability + booking guards
    scheduleId: text('schedule_id').references(() => schedules.id, { onDelete: 'set null' }),
    minNoticeMinutes: integer('min_notice_minutes').default(120).notNull(),
    bookingWindowDays: integer('booking_window_days').default(30).notNull(),
    bufferAfterMinutes: integer('buffer_after_minutes').default(0).notNull(),
    minParticipants: integer('min_participants'),
    // Universal core extras
    slug: text('slug').unique(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
  },
  (t) => ({
    creatorIdx: index('idx_offerings_creator').on(t.creatorProfileId),
    statusIdx: index('idx_offerings_status').on(t.status),
    scheduleIdx: index('idx_offerings_schedule').on(t.scheduleId),
  }),
)

// ============================================================
// SCHEDULING — schedules, rules, overrides
// ============================================================

export const schedules = pgTable(
  'schedules',
  {
    id: text('id').primaryKey(),
    creatorProfileId: text('creator_profile_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    timezone: text('timezone').notNull(), // IANA, e.g. 'Asia/Kolkata' — anchor tz
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
  },
  (t) => ({
    creatorIdx: index('idx_schedules_creator').on(t.creatorProfileId),
  }),
)

export const scheduleRules = pgTable(
  'schedule_rules',
  {
    id: text('id').primaryKey(),
    scheduleId: text('schedule_id')
      .notNull()
      .references(() => schedules.id, { onDelete: 'cascade' }),
    rrule: text('rrule').notNull(), // e.g. 'FREQ=WEEKLY;BYDAY=MO,WE,FR'
    startTime: text('start_time').notNull(), // 'HH:MM' local to schedule.timezone
    endTime: text('end_time').notNull(), // 'HH:MM' local to schedule.timezone
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    scheduleIdx: index('idx_schedule_rules_schedule').on(t.scheduleId),
  }),
)

export const scheduleOverrides = pgTable(
  'schedule_overrides',
  {
    id: text('id').primaryKey(),
    scheduleId: text('schedule_id')
      .notNull()
      .references(() => schedules.id, { onDelete: 'cascade' }),
    date: date('date').notNull(), // 'YYYY-MM-DD' in schedule.timezone
    type: overrideTypeEnum('type').notNull(),
    startTime: text('start_time'), // 'HH:MM' (custom only)
    endTime: text('end_time'), // 'HH:MM' (custom only)
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    scheduleDateUnique: uniqueIndex('uq_schedule_overrides_schedule_date').on(t.scheduleId, t.date),
  }),
)

// ============================================================
// CALENDAR CONNECTIONS — creator's external calendar (Google)
// ============================================================

export const calendarConnections = pgTable(
  'calendar_connections',
  {
    id: text('id').primaryKey(),
    creatorProfileId: text('creator_profile_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'google'
    accountEmail: text('account_email'),
    accessToken: text('access_token'), // ENCRYPTED at rest
    refreshToken: text('refresh_token'), // ENCRYPTED at rest
    tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
    calendarId: text('calendar_id').default('primary').notNull(),
    syncEnabled: boolean('sync_enabled').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
  },
  (t) => ({
    creatorProviderUnique: uniqueIndex('uq_calendar_connections_creator_provider').on(
      t.creatorProfileId,
      t.provider,
    ),
  }),
)

// ============================================================
// BOOKINGS
// ============================================================

export const bookings = pgTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    offeringId: text('offering_id')
      .notNull()
      .references(() => offerings.id, { onDelete: 'cascade' }),
    learnerProfileId: text('learner_profile_id')
      .references(() => learnerProfiles.id, { onDelete: 'cascade' }),
    // Guest booking fields (null when learner is logged in)
    guestName: text('guest_name'),
    guestEmail: text('guest_email'),
    guestPhone: text('guest_phone'),
    // UTC instants (null for digital). withTimezone keeps storage unambiguous.
    startTime: timestamp('start_time', { withTimezone: true }),
    endTime: timestamp('end_time', { withTimezone: true }),
    status: bookingStatusEnum('status').default('pending_payment').notNull(),
    amountPaise: integer('amount_paise').notNull(), // price snapshot at booking
    creatorTimezone: text('creator_timezone'),
    learnerTimezone: text('learner_timezone'),
    // Meeting (provider-agnostic, dynamic per booking)
    meetingProvider: text('meeting_provider'), // 'google_meet' | 'zoom' | 'teams'
    meetingUrl: text('meeting_url'),
    calendarEventId: text('calendar_event_id'),
    // Payment
    razorpayOrderId: text('razorpay_order_id'),
    razorpayPaymentId: text('razorpay_payment_id'),
    // Group only
    waitlistPosition: integer('waitlist_position'),
    // 1:1 only
    topic: text('topic'),
    // Lifecycle
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelledBy: text('cancelled_by'), // 'learner' | 'creator' | 'system'
    cancellationReason: text('cancellation_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
  },
  (t) => ({
    offeringIdx: index('idx_bookings_offering').on(t.offeringId),
    learnerIdx: index('idx_bookings_learner').on(t.learnerProfileId),
    startIdx: index('idx_bookings_start').on(t.startTime),
    // backstop against double-booking a 1:1 slot
    activeSlotUnique: uniqueIndex('uq_bookings_active_slot')
      .on(t.offeringId, t.startTime)
      .where(sql`status in ('pending_payment', 'confirmed')`),
  }),
)

// ============================================================
// TESTIMONIALS
// ============================================================

export const testimonials = pgTable(
  'testimonials',
  {
    id: text('id').primaryKey(),
    creatorProfileId: text('creator_profile_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    learnerName: text('learner_name').notNull(),
    learnerRole: text('learner_role'),
    content: text('content').notNull(),
    rating: integer('rating').default(5).notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    isPublic: boolean('is_public').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    creatorIdx: index('idx_testimonials_creator').on(t.creatorProfileId),
    publicIdx: index('idx_testimonials_public').on(t.isPublic),
    userCreatorUnique: uniqueIndex('uq_testimonial_user_creator').on(t.userId, t.creatorProfileId),
  }),
)
