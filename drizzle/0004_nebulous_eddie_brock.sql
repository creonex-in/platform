ALTER TABLE "creator_profiles" ALTER COLUMN "primary_niche" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."niche";--> statement-breakpoint
CREATE TYPE "public"."niche" AS ENUM('cat_mba_prep', 'coding_dsa', 'personal_finance', 'fitness_nutrition', 'design_creative', 'language_learning', 'digital_marketing', 'music_arts', 'upsc_govt_exams', 'mental_wellness', 'photography', 'science_research', 'real_estate', 'writing_content', 'ai_data_science', 'gaming_esports', 'cooking_food', 'interview_prep', 'ayurveda_yoga', 'startup_product');--> statement-breakpoint
ALTER TABLE "creator_profiles" ALTER COLUMN "primary_niche" SET DATA TYPE "public"."niche" USING "primary_niche"::"public"."niche";--> statement-breakpoint
ALTER TABLE "learner_profiles" DROP COLUMN "budget_range";--> statement-breakpoint
DROP TYPE "public"."budget_range";