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

export const insertMovieLinkSchema = createInsertSchema(movieLinks).omit({
  id: true,
  views: true,
  dateAdded: true,
});

export type InsertMovieLink = z.infer<typeof insertMovieLinkSchema>;
export type MovieLink = typeof movieLinks.$inferSelect;
