import { movieLinks, type MovieLink, type InsertMovieLink } from "@shared/schema";

// Storage interface for movie links
export interface IStorage {
  createMovieLink(movieLink: InsertMovieLink): Promise<MovieLink>;
  getMovieLinks(): Promise<MovieLink[]>;
  getMovieLinkByShortId(shortId: string): Promise<MovieLink | undefined>;
  updateMovieLinkViews(shortId: string): Promise<void>;
  updateMovieLinkOriginalUrl(id: number, originalLink: string): Promise<MovieLink>;
  deleteMovieLink(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private movieLinks: Map<number, MovieLink>;
  private currentId: number;

  constructor() {
    this.movieLinks = new Map();
    this.currentId = 1;
  }

  async createMovieLink(insertMovieLink: InsertMovieLink): Promise<MovieLink> {
    const id = this.currentId++;
    const movieLink: MovieLink = {
      ...insertMovieLink,
      id,
      views: 0,
      dateAdded: new Date(),
      adsEnabled: insertMovieLink.adsEnabled ?? true,
    };
    this.movieLinks.set(id, movieLink);
    return movieLink;
  }

  async getMovieLinks(): Promise<MovieLink[]> {
    return Array.from(this.movieLinks.values());
  }

  async getMovieLinkByShortId(shortId: string): Promise<MovieLink | undefined> {
    return Array.from(this.movieLinks.values()).find(
      (link) => link.shortId === shortId,
    );
  }

  async updateMovieLinkViews(shortId: string): Promise<void> {
    const link = Array.from(this.movieLinks.values()).find(
      (link) => link.shortId === shortId,
    );
    if (link) {
      link.views += 1;
      this.movieLinks.set(link.id, link);
    }
  }

  async updateMovieLinkOriginalUrl(id: number, originalLink: string): Promise<MovieLink> {
    const link = this.movieLinks.get(id);
    if (!link) {
      throw new Error("Movie link not found");
    }
    const updatedLink = { ...link, originalLink };
    this.movieLinks.set(id, updatedLink);
    return updatedLink;
  }

  async deleteMovieLink(id: number): Promise<void> {
    this.movieLinks.delete(id);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getMovieLinks(): Promise<MovieLink[]> {
    const { db } = await import('./db');
    return await db.select().from(movieLinks);
  }

  async getMovieLinkByShortId(shortId: string): Promise<MovieLink | undefined> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const result = await db.select().from(movieLinks).where(eq(movieLinks.shortId, shortId));
    return result[0];
  }

  async createMovieLink(insertMovieLink: InsertMovieLink): Promise<MovieLink> {
    const { db } = await import('./db');
    const result = await db.insert(movieLinks).values({
      ...insertMovieLink,
      adsEnabled: insertMovieLink.adsEnabled ?? true,
    }).returning();
    return result[0];
  }

  async deleteMovieLink(id: number): Promise<void> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    await db.delete(movieLinks).where(eq(movieLinks.id, id));
  }

  async updateViews(shortId: string): Promise<void> {
    const { db } = await import('./db');
    const { eq, sql } = await import('drizzle-orm');
    await db.update(movieLinks)
      .set({ views: sql`${movieLinks.views} + 1` })
      .where(eq(movieLinks.shortId, shortId));
  }

  async updateMovieLinkViews(shortId: string): Promise<void> {
    return this.updateViews(shortId);
  }

  async updateMovieLinkOriginalUrl(id: number, originalLink: string): Promise<MovieLink> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    const result = await db.update(movieLinks)
      .set({ originalLink })
      .where(eq(movieLinks.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error("Movie link not found");
    }
    return result[0];
  }
}

export const storage = new DatabaseStorage();
