ALTER TABLE "users" ADD COLUMN "roles" jsonb DEFAULT '["learner"]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_complete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "intent" text;