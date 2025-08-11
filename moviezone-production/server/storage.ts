import { movieLinks, apiTokens, type MovieLink, type InsertMovieLink, type ApiToken, type InsertApiToken } from "@shared/schema";

// Storage interface for movie links and API tokens
export interface IStorage {
  createMovieLink(movieLink: InsertMovieLink): Promise<MovieLink>;
  getMovieLinks(): Promise<MovieLink[]>;
  getMovieLinkByShortId(shortId: string): Promise<MovieLink | undefined>;
  updateMovieLinkViews(shortId: string): Promise<void>;
  updateMovieLinkOriginalUrl(id: number, originalLink: string): Promise<MovieLink>;
  deleteMovieLink(id: number): Promise<void>;
  
  // API Token methods
  createApiToken(token: InsertApiToken): Promise<ApiToken>;
  getApiTokens(): Promise<ApiToken[]>;
  getApiTokenByValue(tokenValue: string): Promise<ApiToken | undefined>;
  updateTokenLastUsed(tokenValue: string): Promise<void>;
  deactivateApiToken(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private movieLinks: Map<number, MovieLink>;
  private apiTokens: Map<number, ApiToken>;
  private currentId: number;
  private currentTokenId: number;

  constructor() {
    this.movieLinks = new Map();
    this.apiTokens = new Map();
    this.currentId = 1;
    this.currentTokenId = 1;
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

  // API Token methods
  async createApiToken(insertToken: InsertApiToken): Promise<ApiToken> {
    const id = this.currentTokenId++;
    const token: ApiToken = {
      ...insertToken,
      id,
      createdAt: new Date(),
      lastUsed: null,
    };
    this.apiTokens.set(id, token);
    return token;
  }

  async getApiTokens(): Promise<ApiToken[]> {
    return Array.from(this.apiTokens.values());
  }

  async getApiTokenByValue(tokenValue: string): Promise<ApiToken | undefined> {
    return Array.from(this.apiTokens.values()).find(
      (token) => token.tokenValue === tokenValue && token.isActive
    );
  }

  async updateTokenLastUsed(tokenValue: string): Promise<void> {
    const token = Array.from(this.apiTokens.values()).find(
      (t) => t.tokenValue === tokenValue
    );
    if (token) {
      token.lastUsed = new Date();
      this.apiTokens.set(token.id, token);
    }
  }

  async deactivateApiToken(id: number): Promise<void> {
    const token = this.apiTokens.get(id);
    if (token) {
      token.isActive = false;
      this.apiTokens.set(id, token);
    }
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

  // API Token methods
  async createApiToken(insertToken: InsertApiToken): Promise<ApiToken> {
    const { db } = await import('./db');
    const result = await db.insert(apiTokens).values(insertToken).returning();
    return result[0];
  }

  async getApiTokens(): Promise<ApiToken[]> {
    const { db } = await import('./db');
    return await db.select().from(apiTokens);
  }

  async getApiTokenByValue(tokenValue: string): Promise<ApiToken | undefined> {
    const { db } = await import('./db');
    const { eq, and } = await import('drizzle-orm');
    const result = await db.select().from(apiTokens)
      .where(and(
        eq(apiTokens.tokenValue, tokenValue),
        eq(apiTokens.isActive, true)
      ));
    return result[0];
  }

  async updateTokenLastUsed(tokenValue: string): Promise<void> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    await db.update(apiTokens)
      .set({ lastUsed: new Date() })
      .where(eq(apiTokens.tokenValue, tokenValue));
  }

  async deactivateApiToken(id: number): Promise<void> {
    const { db } = await import('./db');
    const { eq } = await import('drizzle-orm');
    await db.update(apiTokens)
      .set({ isActive: false })
      .where(eq(apiTokens.id, id));
  }
}

export const storage = new DatabaseStorage();
