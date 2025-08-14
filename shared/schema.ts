import { pgTable, text, bigserial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const movieLinks = pgTable("movie_links", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  movieName: text("movie_name").notNull(),
  originalLink: text("original_link").notNull(),
  shortId: text("short_id").notNull().unique(),
  views: integer("views").notNull().default(0),
  dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
  adsEnabled: boolean("ads_enabled").notNull().default(true),
});

export const apiTokens = pgTable("api_tokens", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  tokenName: text("token_name").notNull(),
  tokenValue: text("token_value").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsed: timestamp("last_used", { withTimezone: true }),
});

export const qualityMovieLinks = pgTable("quality_movie_links", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  movieName: text("movie_name").notNull(),
  shortId: text("short_id").notNull().unique(),
  quality480p: text("quality_480p"),
  quality720p: text("quality_720p"),
  quality1080p: text("quality_1080p"),
  views: integer("views").notNull().default(0),
  dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
  adsEnabled: boolean("ads_enabled").notNull().default(true),
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

export const insertQualityMovieLinkSchema = createInsertSchema(qualityMovieLinks).omit({
  id: true,
  views: true,
  dateAdded: true,
});

// API request schema for creating short links (universal)
export const createShortLinkSchema = z.object({
  movieName: z.string().min(1, "Movie name is required"),
  originalLink: z.string().url("Valid URL is required"),
  // Note: adsEnabled is not included for API requests - always true
});

// Admin Settings Schema
export const adminSettings = pgTable("admin_settings", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  adminId: text("admin_id").notNull().unique(),
  adminPassword: text("admin_password").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdminSettingsSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertMovieLink = z.infer<typeof insertMovieLinkSchema>;
export type MovieLink = typeof movieLinks.$inferSelect;
export type InsertApiToken = z.infer<typeof insertApiTokenSchema>;
export type ApiToken = typeof apiTokens.$inferSelect;
export type CreateShortLinkRequest = z.infer<typeof createShortLinkSchema>;
export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertQualityMovieLink = z.infer<typeof insertQualityMovieLinkSchema>;
export type QualityMovieLink = typeof qualityMovieLinks.$inferSelect;
