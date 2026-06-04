CREATE TYPE "public"."budget_range" AS ENUM('under_500', '500_1000', '1000_2000', 'above_2000', 'flexible');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('cat_prep', 'job_switch', 'skill_upgrade', 'freelancing', 'investing', 'fitness', 'other');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('not_started', 'pending', 'verified', 'failed');--> statement-breakpoint
CREATE TYPE "public"."niche" AS ENUM('dsa_coding', 'cat_prep', 'personal_finance', 'ui_ux_design', 'system_design', 'fitness', 'content_creation', 'product_management', 'data_science', 'other');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('draft', 'live', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."offer_type" AS ENUM('one_on_one', 'workshop', 'group', 'digital');--> statement-breakpoint
CREATE TYPE "public"."onboarding_status" AS ENUM('not_started', 'in_progress', 'complete');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('learner', 'creator');--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"username" text,
	"display_name" text,
	"bio" text,
	"profile_photo_url" text,
	"cover_banner_url" text,
	"primary_niche" "niche",
	"experience_years" integer,
	"quality_score" numeric(6, 4) DEFAULT '0' NOT NULL,
	"quality_tier" text DEFAULT 'new' NOT NULL,
	"smoothed_rating" numeric(4, 2) DEFAULT '0' NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"total_sessions" integer DEFAULT 0 NOT NULL,
	"response_time_hrs" numeric(6, 2),
	"in_discovery_boost" boolean DEFAULT false NOT NULL,
	"boost_end_date" timestamp,
	"is_live" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"kyc_status" "kyc_status" DEFAULT 'not_started' NOT NULL,
	"social_links" jsonb DEFAULT '{}'::jsonb,
	"languages" jsonb DEFAULT '["English"]'::jsonb NOT NULL,
	"onboarding_status" "onboarding_status" DEFAULT 'not_started' NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "creator_profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "creator_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"goal_type" "goal_type",
	"interested_niches" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"budget_range" "budget_range",
	"onboarding_status" "onboarding_status" DEFAULT 'not_started' NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "learner_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"type" "offer_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"duration_minutes" integer,
	"scheduled_at" timestamp,
	"seats_total" integer,
	"seats_remaining" integer,
	"status" "offer_status" DEFAULT 'draft' NOT NULL,
	"total_bookings" integer DEFAULT 0 NOT NULL,
	"total_revenue_paise" integer DEFAULT 0 NOT NULL,
	"thumbnail_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_step" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_tags" ADD CONSTRAINT "creator_tags_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD CONSTRAINT "learner_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offerings" ADD CONSTRAINT "offerings_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_creator_profiles_quality" ON "creator_profiles" USING btree ("quality_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_creator_profiles_niche" ON "creator_profiles" USING btree ("primary_niche");--> statement-breakpoint
CREATE INDEX "idx_creator_profiles_live" ON "creator_profiles" USING btree ("is_live");--> statement-breakpoint
CREATE INDEX "idx_creator_tags_tag" ON "creator_tags" USING btree ("tag");--> statement-breakpoint
CREATE INDEX "idx_creator_tags_creator" ON "creator_tags" USING btree ("creator_profile_id");--> statement-breakpoint
CREATE INDEX "idx_offerings_creator" ON "offerings" USING btree ("creator_profile_id");--> statement-breakpoint
CREATE INDEX "idx_offerings_status" ON "offerings" USING btree ("status");