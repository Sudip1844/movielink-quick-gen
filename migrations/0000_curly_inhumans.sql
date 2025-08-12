CREATE TABLE "api_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_name" text NOT NULL,
	"token_value" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used" timestamp,
	CONSTRAINT "api_tokens_token_value_unique" UNIQUE("token_value")
);
--> statement-breakpoint
CREATE TABLE "movie_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_name" text NOT NULL,
	"original_link" text NOT NULL,
	"short_id" text NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"date_added" timestamp DEFAULT now() NOT NULL,
	"ads_enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "movie_links_short_id_unique" UNIQUE("short_id")
);
