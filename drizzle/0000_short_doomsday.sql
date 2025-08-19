CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"image" text,
	"name" text NOT NULL,
	"provider" text NOT NULL,
	"user_role" "user_role" DEFAULT 'user' NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "provider_idx" ON "users" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "users" USING btree ("user_role");