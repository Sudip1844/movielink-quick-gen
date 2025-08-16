import { movieLinks, apiTokens, adminSettings, qualityMovieLinks, qualityEpisodes, qualityZips, adViewSessions, type MovieLink, type InsertMovieLink, type ApiToken, type InsertApiToken, type AdminSettings, type InsertAdminSettings, type QualityMovieLink, type InsertQualityMovieLink, type QualityEpisode, type InsertQualityEpisode, type QualityZip, type InsertQualityZip, type AdViewSession, type InsertAdViewSession } from "@shared/schema";

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
  
  // Quality Episodes methods (NEW FEATURE)
  createQualityEpisode(episode: InsertQualityEpisode): Promise<QualityEpisode>;
  getQualityEpisodes(): Promise<QualityEpisode[]>;
  getQualityEpisodeByShortId(shortId: string): Promise<QualityEpisode | undefined>;
  updateQualityEpisodeViews(shortId: string): Promise<void>;
  updateQualityEpisode(id: number, updates: Partial<InsertQualityEpisode>): Promise<QualityEpisode>;
  deleteQualityEpisode(id: number): Promise<void>;
  
  // Quality Zip methods (NEW FEATURE)
  createQualityZip(zip: InsertQualityZip): Promise<QualityZip>;
  getQualityZips(): Promise<QualityZip[]>;
  getQualityZipByShortId(shortId: string): Promise<QualityZip | undefined>;
  updateQualityZipViews(shortId: string): Promise<void>;
  updateQualityZip(id: number, updates: Partial<InsertQualityZip>): Promise<QualityZip>;
  deleteQualityZip(id: number): Promise<void>;
  
  // Ad View Sessions (5 minute timer skip functionality)
  hasSeenAd(ipAddress: string, shortId: string, linkType?: string): Promise<boolean>;
  recordAdView(ipAddress: string, shortId: string, linkType?: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
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

  // Quality Episodes methods (placeholder for deprecated memory storage)
  async createQualityEpisode(insertQualityEpisode: InsertQualityEpisode): Promise<QualityEpisode> {
    throw new Error("Memory storage doesn't support quality episodes");
  }

  async getQualityEpisodes(): Promise<QualityEpisode[]> {
    return [];
  }

  async getQualityEpisodeByShortId(shortId: string): Promise<QualityEpisode | undefined> {
    return undefined;
  }

  async updateQualityEpisodeViews(shortId: string): Promise<void> {
    // No-op in memory storage
  }

  async updateQualityEpisode(id: number, updates: Partial<InsertQualityEpisode>): Promise<QualityEpisode> {
    throw new Error("Memory storage doesn't support quality episodes");
  }

  async deleteQualityEpisode(id: number): Promise<void> {
    // No-op in memory storage
  }

  // Quality Zip methods (placeholder for deprecated memory storage)
  async createQualityZip(insertQualityZip: InsertQualityZip): Promise<QualityZip> {
    throw new Error("Memory storage doesn't support quality zips");
  }

  async getQualityZips(): Promise<QualityZip[]> {
    return [];
  }

  async getQualityZipByShortId(shortId: string): Promise<QualityZip | undefined> {
    return undefined;
  }

  async updateQualityZipViews(shortId: string): Promise<void> {
    // No-op in memory storage
  }

  async updateQualityZip(id: number, updates: Partial<InsertQualityZip>): Promise<QualityZip> {
    throw new Error("Memory storage doesn't support quality zips");
  }

  async deleteQualityZip(id: number): Promise<void> {
    // No-op in memory storage
  }

  // Ad View Sessions methods (placeholder for deprecated memory storage)
  async hasSeenAd(ipAddress: string, shortId: string): Promise<boolean> {
    return false; // Always show ads in memory storage
  }

  async recordAdView(ipAddress: string, shortId: string): Promise<void> {
    // No-op in memory storage
  }

  async cleanupExpiredSessions(): Promise<void> {
    // No-op in memory storage
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

  async updateMovieLinkFull(id: number, originalLink: string, adsEnabled: boolean): Promise<MovieLink> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    const result = await this.supabaseClient.update('movie_links', { 
      original_link: originalLink,
      ads_enabled: adsEnabled 
    }, { id });
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
    // Handle empty strings as null to properly remove links
    if (updates.quality480p !== undefined) updateData.quality_480p = updates.quality480p || null;
    if (updates.quality720p !== undefined) updateData.quality_720p = updates.quality720p || null;
    if (updates.quality1080p !== undefined) updateData.quality_1080p = updates.quality1080p || null;
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

  // Ad View Sessions methods (5-minute timer skip functionality)
  async hasSeenAd(ipAddress: string, shortId: string, linkType: string = 'single'): Promise<boolean> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    
    // First cleanup expired sessions
    await this.cleanupExpiredSessions();
    
    // Check if there's an active session for this IP and shortId
    const sessions = await this.supabaseClient.select('ad_view_sessions', '*', {
      ip_address: ipAddress,
      short_id: shortId,
      link_type: linkType
    });
    
    if (sessions && sessions.length > 0) {
      const session = sessions[0];
      const expiresAt = new Date(session.expires_at);
      const now = new Date();
      
      // If session hasn't expired, user has seen ad recently
      return now < expiresAt;
    }
    
    return false;
  }

  async recordAdView(ipAddress: string, shortId: string, linkType: string = 'single'): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (5 * 60 * 1000)); // 5 minutes from now
    
    // Try to update existing session first
    const existingSessions = await this.supabaseClient.select('ad_view_sessions', '*', {
      ip_address: ipAddress,
      short_id: shortId,
      link_type: linkType
    });
    
    if (existingSessions && existingSessions.length > 0) {
      // Update existing session
      await this.supabaseClient.update('ad_view_sessions', {
        viewed_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      }, { id: existingSessions[0].id });
    } else {
      // Create new session
      await this.supabaseClient.insert('ad_view_sessions', {
        ip_address: ipAddress,
        short_id: shortId,
        link_type: linkType,
        viewed_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      });
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    
    const now = new Date();
    // Delete expired sessions using raw SQL query through supabase client
    try {
      // Get all expired sessions first
      const expiredSessions = await this.supabaseClient.select('ad_view_sessions', 'id', {});
      
      if (expiredSessions && expiredSessions.length > 0) {
        // Filter expired sessions on the client side since we can't do date comparison directly in REST API
        for (const session of expiredSessions) {
          const fullSession = await this.supabaseClient.select('ad_view_sessions', '*', { id: session.id });
          if (fullSession && fullSession[0]) {
            const expiresAt = new Date(fullSession[0].expires_at);
            if (now > expiresAt) {
              await this.supabaseClient.delete('ad_view_sessions', { id: session.id });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }

  // Quality Episodes methods (NEW FEATURE)
  async createQualityEpisode(insertQualityEpisode: InsertQualityEpisode): Promise<QualityEpisode> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    return await this.supabaseClient.insert('quality_episodes', {
      series_name: insertQualityEpisode.seriesName,
      short_id: insertQualityEpisode.shortId,
      start_from_episode: insertQualityEpisode.startFromEpisode,
      episodes: insertQualityEpisode.episodes,
      ads_enabled: insertQualityEpisode.adsEnabled ?? true,
    });
  }

  async getQualityEpisodes(): Promise<QualityEpisode[]> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    return await this.supabaseClient.select('quality_episodes');
  }

  async getQualityEpisodeByShortId(shortId: string): Promise<QualityEpisode | undefined> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    const result = await this.supabaseClient.select('quality_episodes', '*', { short_id: shortId });
    return result[0];
  }

  async updateQualityEpisodeViews(shortId: string): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    
    // First get current views
    const current = await this.supabaseClient.select('quality_episodes', 'views', { short_id: shortId });
    if (current[0]) {
      const newViews = (current[0].views || 0) + 1;
      await this.supabaseClient.update('quality_episodes', { views: newViews }, { short_id: shortId });
    }
  }

  async updateQualityEpisode(id: number, updates: Partial<InsertQualityEpisode>): Promise<QualityEpisode> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    
    const updateData: any = {};
    if (updates.seriesName !== undefined) updateData.series_name = updates.seriesName;
    if (updates.startFromEpisode !== undefined) updateData.start_from_episode = updates.startFromEpisode;
    if (updates.episodes !== undefined) updateData.episodes = updates.episodes;
    if (updates.adsEnabled !== undefined) updateData.ads_enabled = updates.adsEnabled;
    
    const result = await this.supabaseClient.update('quality_episodes', updateData, { id });
    if (!result) {
      throw new Error("Quality episode not found");
    }
    return result;
  }

  async deleteQualityEpisode(id: number): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    await this.supabaseClient.delete('quality_episodes', { id });
  }

  // Quality Zip methods (NEW FEATURE)
  async createQualityZip(insertQualityZip: InsertQualityZip): Promise<QualityZip> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    return await this.supabaseClient.insert('quality_zips', {
      movie_name: insertQualityZip.movieName,
      short_id: insertQualityZip.shortId,
      from_episode: insertQualityZip.fromEpisode,
      to_episode: insertQualityZip.toEpisode,
      quality_480p: insertQualityZip.quality480p || null,
      quality_720p: insertQualityZip.quality720p || null,
      quality_1080p: insertQualityZip.quality1080p || null,
      ads_enabled: insertQualityZip.adsEnabled ?? true,
    });
  }

  async getQualityZips(): Promise<QualityZip[]> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    return await this.supabaseClient.select('quality_zips');
  }

  async getQualityZipByShortId(shortId: string): Promise<QualityZip | undefined> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    const result = await this.supabaseClient.select('quality_zips', '*', { short_id: shortId });
    return result[0];
  }

  async updateQualityZipViews(shortId: string): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    
    // First get current views
    const current = await this.supabaseClient.select('quality_zips', 'views', { short_id: shortId });
    if (current[0]) {
      const newViews = (current[0].views || 0) + 1;
      await this.supabaseClient.update('quality_zips', { views: newViews }, { short_id: shortId });
    }
  }

  async updateQualityZip(id: number, updates: Partial<InsertQualityZip>): Promise<QualityZip> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    
    const updateData: any = {};
    if (updates.movieName !== undefined) updateData.movie_name = updates.movieName;
    if (updates.fromEpisode !== undefined) updateData.from_episode = updates.fromEpisode;
    if (updates.toEpisode !== undefined) updateData.to_episode = updates.toEpisode;
    if (updates.quality480p !== undefined) updateData.quality_480p = updates.quality480p || null;
    if (updates.quality720p !== undefined) updateData.quality_720p = updates.quality720p || null;
    if (updates.quality1080p !== undefined) updateData.quality_1080p = updates.quality1080p || null;
    if (updates.adsEnabled !== undefined) updateData.ads_enabled = updates.adsEnabled;
    
    const result = await this.supabaseClient.update('quality_zips', updateData, { id });
    if (!result) {
      throw new Error("Quality zip not found");
    }
    return result;
  }

  async deleteQualityZip(id: number): Promise<void> {
    if (!this.supabaseClient) {
      const { supabase } = await import('./supabase-client');
      this.supabaseClient = supabase;
    }
    await this.supabaseClient.delete('quality_zips', { id });
  }
}

// Use only Supabase DatabaseStorage - no memory storage needed
export const storage = new DatabaseStorage();
