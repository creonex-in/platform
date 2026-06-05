import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  integer,
  pgEnum,
  decimal,
  index,
} from 'drizzle-orm/pg-core'

// ============================================================
// ENUMS
// ============================================================

export const roleEnum = pgEnum('role', ['learner', 'creator'])

export const goalTypeEnum = pgEnum('goal_type', [
  'cat_prep',
  'job_switch',
  'skill_upgrade',
  'freelancing',
  'investing',
  'fitness',
  'other',
])

export const nicheEnum = pgEnum('niche', [
  'cat_mba_prep',
  'coding_dsa',
  'personal_finance',
  'fitness_nutrition',
  'design_creative',
  'language_learning',
  'digital_marketing',
  'music_arts',
  'upsc_govt_exams',
  'mental_wellness',
  'photography',
  'science_research',
  'real_estate',
  'writing_content',
  'ai_data_science',
  'gaming_esports',
  'cooking_food',
  'interview_prep',
  'ayurveda_yoga',
  'startup_product',
])

export const offerTypeEnum = pgEnum('offer_type', [
  'one_on_one',
  'workshop',
  'group',
  'digital',
])

export const offerStatusEnum = pgEnum('offer_status', [
  'draft',
  'live',
  'paused',
  'archived',
])

export const kycStatusEnum = pgEnum('kyc_status', [
  'not_started',
  'pending',
  'verified',
  'failed',
])

export const onboardingStatusEnum = pgEnum('onboarding_status', [
  'not_started',
  'in_progress',
  'complete',
])

// ============================================================
// USERS — identity layer, mirrors Clerk
// ============================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').unique().notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),

  // Mirrors Clerk publicMetadata — Clerk is authority
  roles: jsonb('roles')
    .$type<('learner' | 'creator')[]>()
    .default(['learner'])
    .notNull(),
  onboardingComplete: boolean('onboarding_complete')
    .default(false)
    .notNull(),

  onboardingStep: integer('onboarding_step').default(1).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================
// LEARNER PROFILES
// ============================================================

export const learnerProfiles = pgTable('learner_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  goalType: goalTypeEnum('goal_type'),

  // Populated from booking history — NOT set during onboarding
  interestedNiches: jsonb('interested_niches')
    .$type<string[]>()
    .default([])
    .notNull(),

  onboardingStatus: onboardingStatusEnum('onboarding_status')
    .default('not_started')
    .notNull(),
  currentStep: integer('current_step').default(1).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================
// CREATOR PROFILES
// ============================================================

export const creatorProfiles = pgTable('creator_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

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

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
},
  (t) => ({
    qualityIdx: index('idx_creator_profiles_quality').on(t.qualityScore.desc()),
    nicheIdx: index('idx_creator_profiles_niche').on(t.primaryNiche),
    liveIdx: index('idx_creator_profiles_live').on(t.isLive),
  }))

// ============================================================
// CREATOR TAGS
// ============================================================

export const creatorTags = pgTable('creator_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorProfileId: uuid('creator_profile_id')
    .notNull()
    .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
},
  (t) => ({
    tagIdx: index('idx_creator_tags_tag').on(t.tag),
    creatorIdx: index('idx_creator_tags_creator').on(t.creatorProfileId),
  }))

// ============================================================
// OFFERINGS
// ============================================================

export const offerings = pgTable('offerings', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorProfileId: uuid('creator_profile_id')
    .notNull()
    .references(() => creatorProfiles.id, { onDelete: 'cascade' }),

  type: offerTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // stored in paise (rupees × 100)
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
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
},
  (t) => ({
    creatorIdx: index('idx_offerings_creator').on(t.creatorProfileId),
    statusIdx: index('idx_offerings_status').on(t.status),
  }))
