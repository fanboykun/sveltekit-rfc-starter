CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"image" text,
	"name" text NOT NULL,
	"provider" text NOT NULL,
	"user_role" "user_role" DEFAULT 'user' NOT NULL,
	"password" text,
	"access_token" text,
	"refresh_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "provider_idx" ON "users" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "users" USING btree ("user_role");--> statement-breakpoint
CREATE INDEX "user_idx" ON "sessions" USING btree ("user_id");