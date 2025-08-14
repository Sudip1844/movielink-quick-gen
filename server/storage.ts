import { movieLinks, apiTokens, adminSettings, qualityMovieLinks, type MovieLink, type InsertMovieLink, type ApiToken, type InsertApiToken, type AdminSettings, type InsertAdminSettings, type QualityMovieLink, type InsertQualityMovieLink } from "@shared/schema";

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
  deleteApiToken(id: number): Promise<void>;
  deactivateApiToken(id: number): Promise<void>;
  
  // Admin Settings methods
  getAdminSettings(): Promise<AdminSettings | undefined>;
  updateAdminCredentials(adminId: string, adminPassword: string): Promise<AdminSettings>;
  
  // Quality Movie Links methods
  createQualityMovieLink(movieLink: InsertQualityMovieLink): Promise<QualityMovieLink>;
  getQualityMovieLinks(): Promise<QualityMovieLink[]>;
  getQualityMovieLinkByShortId(shortId: string): Promise<QualityMovieLink | undefined>;
  updateQualityMovieLinkViews(shortId: string): Promise<void>;
  updateQualityMovieLink(id: number, updates: Partial<InsertQualityMovieLink>): Promise<QualityMovieLink>;
  deleteQualityMovieLink(id: number): Promise<void>;
}

// Memory storage removed - using only Supabase storage
export class DeprecatedMemStorage implements IStorage {
  private movieLinks: Map<number, MovieLink>;
  private apiTokens: Map<number, ApiToken>;
  private qualityMovieLinks: Map<number, QualityMovieLink>;
  private currentId: number;
  private currentTokenId: number;
  private currentQualityId: number;

  constructor() {
    this.movieLinks = new Map();
    this.apiTokens = new Map();
    this.qualityMovieLinks = new Map();
    this.currentId = 1;
    this.currentTokenId = 1;
    this.currentQualityId = 1;
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
      tokenType: insertToken.tokenType ?? "single",
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

  async deleteApiToken(id: number): Promise<void> {
    this.apiTokens.delete(id);
  }

  async deactivateApiToken(id: number): Promise<void> {
    const token = this.apiTokens.get(id);
    if (token) {
      token.isActive = false;
      this.apiTokens.set(id, token);
    }
  }

  async getAdminSettings(): Promise<AdminSettings | undefined> {
    // Memory storage doesn't support admin settings
    return undefined;
  }

  async updateAdminCredentials(adminId: string, adminPassword: string): Promise<AdminSettings> {
    throw new Error("Memory storage doesn't support admin credentials update");
  }

  // Quality Movie Links methods
  async createQualityMovieLink(insertQualityMovieLink: InsertQualityMovieLink): Promise<QualityMovieLink> {
    const id = this.currentQualityId++;
    const qualityMovieLink: QualityMovieLink = {
      ...insertQualityMovieLink,
      id,
      views: 0,
      dateAdded: new Date(),
      adsEnabled: insertQualityMovieLink.adsEnabled ?? true,
      quality480p: insertQualityMovieLink.quality480p ?? null,
      quality720p: insertQualityMovieLink.quality720p ?? null,
      quality1080p: insertQualityMovieLink.quality1080p ?? null,
    };
    this.qualityMovieLinks.set(id, qualityMovieLink);
    return qualityMovieLink;
  }

  async getQualityMovieLinks(): Promise<QualityMovieLink[]> {
    return Array.from(this.qualityMovieLinks.values());
  }

  async getQualityMovieLinkByShortId(shortId: string): Promise<QualityMovieLink | undefined> {
    return Array.from(this.qualityMovieLinks.values()).find(
      (link) => link.shortId === shortId,
    );
  }

  async updateQualityMovieLinkViews(shortId: string): Promise<void> {
    const link = Array.from(this.qualityMovieLinks.values()).find(
      (link) => link.shortId === shortId,
    );
    if (link) {
      link.views += 1;
      this.qualityMovieLinks.set(link.id, link);
    }
  }

  async updateQualityMovieLink(id: number, updates: Partial<InsertQualityMovieLink>): Promise<QualityMovieLink> {
    const link = this.qualityMovieLinks.get(id);
    if (!link) {
      throw new Error("Quality movie link not found");
    }
    const updatedLink = { ...link, ...updates };
    this.qualityMovieLinks.set(id, updatedLink);
    return updatedLink;
  }

  async deleteQualityMovieLink(id: number): Promise<void> {
    this.qualityMovieLinks.delete(id);
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
      token_type: insertToken.tokenType ?? "single",
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
    
    try {
      console.log(`Updating API token ${id} to active: ${isActive}`);
      const result = await this.supabaseClient.update('api_tokens', 
        { is_active: isActive }, 
        { id }
      );
      console.log('Update result:', result);
      
      // If result is null or undefined, fetch the updated token
      if (!result) {
        const tokens = await this.supabaseClient.select('api_tokens', '*', { id });
        if (tokens && tokens.length > 0) {
          return tokens[0];
        }
        throw new Error("API token not found after update");
      }
      
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error('Error updating API token status:', error);
      throw error;
    }
  }

  async getAdminSettings(): Promise<AdminSettings | undefined> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    try {
      console.log('Fetching admin settings from Supabase...');
      const result = await this.supabaseClient.select('admin_settings');
      console.log('Admin settings result:', result);
      return result && result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error fetching admin settings:', error);
      return undefined;
    }
  }

  async updateAdminCredentials(adminId: string, adminPassword: string): Promise<AdminSettings> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    const result = await this.supabaseClient.update('admin_settings', 
      { admin_id: adminId, admin_password: adminPassword, updated_at: new Date().toISOString() }, 
      { id: 1 }
    );
    if (!result || result.length === 0) {
      throw new Error("Admin settings not found");
    }
    return result[0];
  }

  async deleteApiToken(id: number): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    await this.supabaseClient.delete('api_tokens', { id });
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

  // Quality Movie Links methods
  async createQualityMovieLink(insertQualityMovieLink: InsertQualityMovieLink): Promise<QualityMovieLink> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    return await this.supabaseClient.insert('quality_movie_links', {
      movie_name: insertQualityMovieLink.movieName,
      short_id: insertQualityMovieLink.shortId,
      quality_480p: insertQualityMovieLink.quality480p || null,
      quality_720p: insertQualityMovieLink.quality720p || null,
      quality_1080p: insertQualityMovieLink.quality1080p || null,
      ads_enabled: insertQualityMovieLink.adsEnabled ?? true,
    });
  }

  async getQualityMovieLinks(): Promise<QualityMovieLink[]> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    return await this.supabaseClient.select('quality_movie_links');
  }

  async getQualityMovieLinkByShortId(shortId: string): Promise<QualityMovieLink | undefined> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    const result = await this.supabaseClient.select('quality_movie_links', '*', { short_id: shortId });
    return result[0];
  }

  async updateQualityMovieLinkViews(shortId: string): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    
    // First get current views
    const current = await this.supabaseClient.select('quality_movie_links', 'views', { short_id: shortId });
    if (current[0]) {
      const newViews = (current[0].views || 0) + 1;
      await this.supabaseClient.update('quality_movie_links', { views: newViews }, { short_id: shortId });
    }
  }

  async updateQualityMovieLink(id: number, updates: Partial<InsertQualityMovieLink>): Promise<QualityMovieLink> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    
    const updateData: any = {};
    if (updates.movieName !== undefined) updateData.movie_name = updates.movieName;
    if (updates.quality480p !== undefined) updateData.quality_480p = updates.quality480p;
    if (updates.quality720p !== undefined) updateData.quality_720p = updates.quality720p;
    if (updates.quality1080p !== undefined) updateData.quality_1080p = updates.quality1080p;
    if (updates.adsEnabled !== undefined) updateData.ads_enabled = updates.adsEnabled;
    
    const result = await this.supabaseClient.update('quality_movie_links', updateData, { id });
    if (!result) {
      throw new Error("Quality movie link not found");
    }
    return result;
  }

  async deleteQualityMovieLink(id: number): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    await this.supabaseClient.delete('quality_movie_links', { id });
  }
}

// Use only Supabase DatabaseStorage - no memory storage needed
export const storage = new DatabaseStorage();
