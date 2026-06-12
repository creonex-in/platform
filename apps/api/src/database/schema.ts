import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  pgEnum,
  decimal,
  index,
} from 'drizzle-orm/pg-core'
import {
  NICHES,
  GOAL_TYPES,
  OFFER_TYPES,
  OFFER_STATUSES,
  KYC_STATUSES,
  ONBOARDING_STATUSES,
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
    responseTimeHrs: decimal('response_time_hrs', { precision: 6, scale: 2 }),
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
    nicheCategory: text('niche_category'),
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
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
  },
  (t) => ({
    creatorIdx: index('idx_offerings_creator').on(t.creatorProfileId),
    statusIdx: index('idx_offerings_status').on(t.status),
  }),
)
