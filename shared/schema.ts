import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const movieLinks = pgTable("movie_links", {
  id: serial("id").primaryKey(),
  movieName: text("movie_name").notNull(),
  originalLink: text("original_link").notNull(),
  shortId: text("short_id").notNull().unique(),
  views: integer("views").notNull().default(0),
  dateAdded: timestamp("date_added").notNull().defaultNow(),
  adsEnabled: boolean("ads_enabled").notNull().default(true),
});

export const apiTokens = pgTable("api_tokens", {
  id: serial("id").primaryKey(),
  tokenName: text("token_name").notNull(),
  tokenValue: text("token_value").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsed: timestamp("last_used"),
});

export const insertMovieLinkSchema = createInsertSchema(movieLinks).omit({
  id: true,
  views: true,
  dateAdded: true,
});

export const insertApiTokenSchema = createInsertSchema(apiTokens).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

// API request schema for creating short links
export const createShortLinkSchema = z.object({
  movieName: z.string().min(1, "Movie name is required"),
  originalLink: z.string().url("Valid URL is required"),
  adsEnabled: z.boolean().optional().default(true),
});

export type InsertMovieLink = z.infer<typeof insertMovieLinkSchema>;
export type MovieLink = typeof movieLinks.$inferSelect;
export type InsertApiToken = z.infer<typeof insertApiTokenSchema>;
export type ApiToken = typeof apiTokens.$inferSelect;
export type CreateShortLinkRequest = z.infer<typeof createShortLinkSchema>;
