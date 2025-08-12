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
  updateApiTokenStatus(id: number, isActive: boolean): Promise<ApiToken>;
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
      isActive: insertToken.isActive ?? true,
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

  async updateApiTokenStatus(id: number, isActive: boolean): Promise<ApiToken> {
    const token = this.apiTokens.get(id);
    if (!token) {
      throw new Error("API token not found");
    }
    token.isActive = isActive;
    this.apiTokens.set(id, token);
    return token;
  }

  async deactivateApiToken(id: number): Promise<void> {
    const token = this.apiTokens.get(id);
    if (token) {
      token.isActive = false;
      this.apiTokens.set(id, token);
    }
  }
}

// Supabase storage implementation using REST API
export class DatabaseStorage implements IStorage {
  private supabaseClient: any;

  constructor() {
    this.initSupabase();
  }

  private async initSupabase() {
    const { supabase } = await import('./supabase-client');
    this.supabaseClient = supabase;
  }

  async getMovieLinks(): Promise<MovieLink[]> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    return await this.supabaseClient.select('movie_links');
  }

  async getMovieLinkByShortId(shortId: string): Promise<MovieLink | undefined> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    const result = await this.supabaseClient.select('movie_links', '*', { short_id: shortId });
    return result[0];
  }

  async createMovieLink(insertMovieLink: InsertMovieLink): Promise<MovieLink> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    return await this.supabaseClient.insert('movie_links', {
      movie_name: insertMovieLink.movieName,
      original_link: insertMovieLink.originalLink,
      short_id: insertMovieLink.shortId,
      ads_enabled: insertMovieLink.adsEnabled ?? true,
    });
  }

  async deleteMovieLink(id: number): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    await this.supabaseClient.delete('movie_links', { id });
  }

  async updateMovieLinkViews(shortId: string): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    
    // First get current views
    const current = await this.supabaseClient.select('movie_links', 'views', { short_id: shortId });
    if (current[0]) {
      const newViews = (current[0].views || 0) + 1;
      await this.supabaseClient.update('movie_links', { views: newViews }, { short_id: shortId });
    }
  }

  async updateMovieLinkOriginalUrl(id: number, originalLink: string): Promise<MovieLink> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    const result = await this.supabaseClient.update('movie_links', { original_link: originalLink }, { id });
    if (!result) {
      throw new Error("Movie link not found");
    }
    return result;
  }

  // API Token methods
  async createApiToken(insertToken: InsertApiToken): Promise<ApiToken> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    return await this.supabaseClient.insert('api_tokens', {
      token_name: insertToken.tokenName,
      token_value: insertToken.tokenValue,
      is_active: insertToken.isActive ?? true,
    });
  }

  async getApiTokens(): Promise<ApiToken[]> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    return await this.supabaseClient.select('api_tokens');
  }

  async getApiTokenByValue(tokenValue: string): Promise<ApiToken | undefined> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    const result = await this.supabaseClient.select('api_tokens', '*', { 
      token_value: tokenValue, 
      is_active: true 
    });
    return result[0];
  }

  async updateTokenLastUsed(tokenValue: string): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    await this.supabaseClient.update('api_tokens', 
      { last_used: new Date().toISOString() }, 
      { token_value: tokenValue }
    );
  }

  async updateApiTokenStatus(id: number, isActive: boolean): Promise<ApiToken> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    const result = await this.supabaseClient.update('api_tokens', 
      { is_active: isActive }, 
      { id }
    );
    if (!result) {
      throw new Error("API token not found");
    }
    return result;
  }

  async deactivateApiToken(id: number): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    await this.supabaseClient.update('api_tokens', 
      { is_active: false }, 
      { id }
    );
  }
}

export const storage = new DatabaseStorage();
