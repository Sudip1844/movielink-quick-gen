import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMovieLinkSchema, createShortLinkSchema, insertQualityMovieLinkSchema, createQualityShortLinkSchema, insertQualityEpisodeSchema, createQualityEpisodeSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

// Load environment configuration synchronously
function loadEnvConfig() {
  try {
    return require('../env-config.js');
  } catch (error) {
    console.log('env-config.js not found, using environment variables');
    return {};
  }
}

const envConfig = loadEnvConfig();

// Authentication middleware for secure API endpoints
async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const apiToken = await storage.getApiTokenByValue(token);
    if (!apiToken) {
      return res.status(403).json({ error: "Invalid or inactive token" });
    }

    // Update last used timestamp
    await storage.updateTokenLastUsed(token);
    
    // Add token info to request for potential use
    (req as any).apiToken = apiToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token verification failed" });
  }
}

// Utility function to generate short IDs
function generateShortId(): string {
  return crypto.randomBytes(3).toString('hex');
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Admin configuration endpoint - get from Supabase ONLY
  app.get("/api/admin-config", async (req, res) => {
    try {
      console.log('Fetching admin config from API endpoint...');
      const adminSettings = await storage.getAdminSettings();
      console.log('Admin settings response:', adminSettings);
      
      if (!adminSettings) {
        console.log('No admin settings found');
        return res.status(404).json({ 
          error: "Admin settings not found in database. Please check Supabase admin_settings table." 
        });
      }
      
      console.log('Admin settings found:', adminSettings);
      // Handle both snake_case (Supabase) and camelCase field names
      const response = {
        adminId: (adminSettings as any).admin_id || (adminSettings as any).adminId,
        adminPassword: (adminSettings as any).admin_password || (adminSettings as any).adminPassword
      };
      console.log('Sending response:', response);
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching admin config:", error);
      res.status(500).json({ 
        error: "Failed to fetch admin configuration from database" 
      });
    }
  });

  // Update admin credentials
  app.patch("/api/admin-config", async (req, res) => {
    try {
      const { adminId, adminPassword } = req.body;
      
      if (!adminId || !adminPassword) {
        return res.status(400).json({ error: "Admin ID and password are required" });
      }
      
      const updatedSettings = await storage.updateAdminCredentials(adminId, adminPassword);
      res.json({
        adminId: updatedSettings.adminId,
        adminPassword: updatedSettings.adminPassword,
        updatedAt: updatedSettings.updatedAt
      });
    } catch (error) {
      console.error("Error updating admin config:", error);
      res.status(500).json({ error: "Failed to update admin configuration" });
    }
  });
  
  // Universal API endpoint for creating single short links
  app.post("/api/create-short-link", authenticateToken, async (req, res) => {
    try {
      // Check if token is for single links
      const apiToken = (req as any).apiToken;
      if (apiToken.tokenType !== "single") {
        return res.status(403).json({ error: "This token is not authorized for single link creation" });
      }

      const result = createShortLinkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: result.error.issues 
        });
      }
      
      const { movieName, originalLink } = result.data;
      
      // Generate unique short ID
      let shortId: string;
      let attempts = 0;
      do {
        shortId = generateShortId();
        attempts++;
        if (attempts > 10) {
          return res.status(500).json({ error: "Failed to generate unique short ID" });
        }
      } while (await storage.getMovieLinkByShortId(shortId));
      
      // API created links always have ads enabled (cannot be disabled)
      const movieLink = await storage.createMovieLink({
        movieName,
        originalLink,
        shortId,
        adsEnabled: true, // Always true for API created links
      });
      
      const shortUrl = `${req.protocol}://${req.get('host')}/m/${shortId}`;
      
      res.status(201).json({
        success: true,
        shortUrl,
        shortId: movieLink.shortId,
        movieName: movieLink.movieName,
        originalLink: movieLink.originalLink,
        adsEnabled: movieLink.adsEnabled,
      });
    } catch (error) {
      console.error("Error creating short link:", error);
      res.status(500).json({ error: "Failed to create short link" });
    }
  });

  // Universal API endpoint for creating quality short links
  app.post("/api/create-quality-short-link", authenticateToken, async (req, res) => {
    try {
      // Check if token is for quality links
      const apiToken = (req as any).apiToken;
      if (apiToken.tokenType !== "quality") {
        return res.status(403).json({ error: "This token is not authorized for quality link creation" });
      }

      const result = createQualityShortLinkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: result.error.issues 
        });
      }
      
      const { movieName, quality480p, quality720p, quality1080p } = result.data;
      
      // Generate unique short ID
      let shortId: string;
      let attempts = 0;
      do {
        shortId = generateShortId();
        attempts++;
        if (attempts > 10) {
          return res.status(500).json({ error: "Failed to generate unique short ID" });
        }
      } while (await storage.getQualityMovieLinkByShortId(shortId) || await storage.getMovieLinkByShortId(shortId));
      
      // API created links always have ads enabled (cannot be disabled)
      const qualityMovieLink = await storage.createQualityMovieLink({
        movieName,
        shortId,
        quality480p: quality480p || null,
        quality720p: quality720p || null,
        quality1080p: quality1080p || null,
        adsEnabled: true, // Always true for API created links
      });
      
      const shortUrl = `${req.protocol}://${req.get('host')}/m/${shortId}`;
      
      res.status(201).json({
        success: true,
        shortUrl,
        shortId: qualityMovieLink.shortId,
        movieName: qualityMovieLink.movieName,
        qualityLinks: {
          quality480p: qualityMovieLink.quality480p,
          quality720p: qualityMovieLink.quality720p,
          quality1080p: qualityMovieLink.quality1080p
        },
        adsEnabled: qualityMovieLink.adsEnabled,
      });
    } catch (error) {
      console.error("Error creating quality short link:", error);
      res.status(500).json({ error: "Failed to create quality short link" });
    }
  });

  // Movie Links API routes (admin panel)
  
  // Get all movie links
  app.get("/api/movie-links", async (req, res) => {
    try {
      const links = await storage.getMovieLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch movie links" });
    }
  });

  // Create a new movie link
  app.post("/api/movie-links", async (req, res) => {
    try {
      const result = insertMovieLinkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data", details: result.error });
      }
      
      const movieLink = await storage.createMovieLink(result.data);
      res.status(201).json(movieLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to create movie link" });
    }
  });

  // Get movie link by short ID
  app.get("/api/movie-links/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const link = await storage.getMovieLinkByShortId(shortId);
      
      if (!link) {
        return res.status(404).json({ error: "Movie link not found" });
      }
      
      res.json(link);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch movie link" });
    }
  });

  // Update movie link views
  app.patch("/api/movie-links/:shortId/views", async (req, res) => {
    try {
      const { shortId } = req.params;
      await storage.updateMovieLinkViews(shortId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update views" });
    }
  });

  // Update movie link original URL and/or ads enabled status
  app.patch("/api/movie-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const { originalLink, adsEnabled } = req.body;
      if (!originalLink || typeof originalLink !== "string") {
        return res.status(400).json({ error: "Original link is required" });
      }
      
      let updatedLink;
      if (adsEnabled !== undefined) {
        // Update both originalLink and adsEnabled using a comprehensive update method
        updatedLink = await storage.updateMovieLinkFull(id, originalLink, adsEnabled);
      } else {
        // Update only originalLink (backward compatibility)
        updatedLink = await storage.updateMovieLinkOriginalUrl(id, originalLink);
      }
      
      res.json(updatedLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to update movie link" });
    }
  });



  // Delete a movie link
  app.delete("/api/movie-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      await storage.deleteMovieLink(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete movie link" });
    }
  });

  // API Token management routes (admin only)
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getApiTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API tokens" });
    }
  });

  app.post("/api/tokens", async (req, res) => {
    try {
      const { tokenName, tokenType } = req.body;
      
      if (!tokenName || typeof tokenName !== "string") {
        return res.status(400).json({ error: "Token name is required" });
      }
      
      if (!tokenType || !["single", "quality"].includes(tokenType)) {
        return res.status(400).json({ error: "Token type must be 'single' or 'quality'" });
      }
      
      // Generate secure token
      const tokenValue = crypto.randomBytes(32).toString('hex');
      
      const apiToken = await storage.createApiToken({
        tokenName,
        tokenValue,
        tokenType,
        isActive: true,
      });
      
      res.status(201).json(apiToken);
    } catch (error) {
      console.error("Error creating API token:", error);
      res.status(500).json({ error: "Failed to create API token" });
    }
  });

  // Update API token status
  app.patch("/api/tokens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid token ID" });
      }
      
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive field is required and must be boolean" });
      }
      
      const updatedToken = await storage.updateApiTokenStatus(id, isActive);
      res.json(updatedToken);
    } catch (error) {
      console.error("Error updating API token:", error);
      res.status(500).json({ error: "Failed to update API token" });
    }
  });

  app.delete("/api/tokens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid token ID" });
      }
      
      await storage.deleteApiToken(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting API token:", error);
      res.status(500).json({ error: "Failed to delete token" });
    }
  });

  // Quality Movie Links API routes (admin panel)
  
  // Get all quality movie links
  app.get("/api/quality-movie-links", async (req, res) => {
    try {
      const links = await storage.getQualityMovieLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality movie links" });
    }
  });

  // Create a new quality movie link
  app.post("/api/quality-movie-links", async (req, res) => {
    try {
      const result = insertQualityMovieLinkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data", details: result.error });
      }
      
      const qualityMovieLink = await storage.createQualityMovieLink(result.data);
      res.status(201).json(qualityMovieLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to create quality movie link" });
    }
  });

  // Get quality movie link by short ID
  app.get("/api/quality-movie-links/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const link = await storage.getQualityMovieLinkByShortId(shortId);
      
      if (!link) {
        return res.status(404).json({ error: "Quality movie link not found" });
      }
      
      res.json(link);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality movie link" });
    }
  });

  // Update quality movie link views
  app.patch("/api/quality-movie-links/:shortId/views", async (req, res) => {
    try {
      const { shortId } = req.params;
      await storage.updateQualityMovieLinkViews(shortId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update views" });
    }
  });

  // Update quality movie link
  app.patch("/api/quality-movie-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const updates = req.body;
      const updatedLink = await storage.updateQualityMovieLink(id, updates);
      res.json(updatedLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quality movie link" });
    }
  });

  // Delete a quality movie link
  app.delete("/api/quality-movie-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      await storage.deleteQualityMovieLink(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quality movie link" });
    }
  });

  // ===== QUALITY EPISODES API ROUTES (NEW FEATURE) =====
  
  // Universal API endpoint for creating quality episode series
  app.post("/api/create-quality-episode", authenticateToken, async (req, res) => {
    try {
      // Check if token is for episode links
      const apiToken = (req as any).apiToken;
      if (apiToken.tokenType !== "episode") {
        return res.status(403).json({ error: "This token is not authorized for episode creation" });
      }

      const result = createQualityEpisodeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: result.error.issues 
        });
      }
      
      const { seriesName, startFromEpisode, episodes } = result.data;
      
      // Generate unique short ID
      let shortId: string;
      let attempts = 0;
      do {
        shortId = generateShortId();
        const existing = await storage.getQualityEpisodeByShortId(shortId);
        if (!existing) break;
        attempts++;
      } while (attempts < 10);
      
      if (attempts >= 10) {
        return res.status(500).json({ error: "Unable to generate unique short ID" });
      }
      
      // Create the quality episode series with JSON-serialized episodes
      const qualityEpisode = await storage.createQualityEpisode({
        seriesName,
        shortId,
        startFromEpisode,
        episodes: JSON.stringify(episodes),
        adsEnabled: true, // API-created episodes always have ads enabled
      });
      
      // Return the short URL
      const shortUrl = `${req.protocol}://${req.get('host')}/e/${shortId}`;
      res.status(201).json({ 
        shortUrl,
        shortId,
        seriesName,
        startFromEpisode,
        episodeCount: episodes.length
      });
    } catch (error) {
      console.error("Error creating quality episode series:", error);
      res.status(500).json({ error: "Failed to create quality episode series" });
    }
  });

  // Get all quality episodes
  app.get("/api/quality-episodes", async (req, res) => {
    try {
      const episodes = await storage.getQualityEpisodes();
      res.json(episodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality episodes" });
    }
  });

  // Create a new quality episode series (Admin Panel)
  app.post("/api/quality-episodes", async (req, res) => {
    try {
      const result = insertQualityEpisodeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data", details: result.error });
      }
      
      const qualityEpisode = await storage.createQualityEpisode(result.data);
      res.status(201).json(qualityEpisode);
    } catch (error) {
      res.status(500).json({ error: "Failed to create quality episode series" });
    }
  });

  // Get quality episode series by short ID
  app.get("/api/quality-episodes/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const episode = await storage.getQualityEpisodeByShortId(shortId);
      
      if (!episode) {
        return res.status(404).json({ error: "Quality episode series not found" });
      }
      
      res.json(episode);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality episode series" });
    }
  });

  // Update quality episode series views
  app.patch("/api/quality-episodes/:shortId/views", async (req, res) => {
    try {
      const { shortId } = req.params;
      await storage.updateQualityEpisodeViews(shortId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update views" });
    }
  });

  // Update quality episode series
  app.patch("/api/quality-episodes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const updates = req.body;
      const updatedEpisode = await storage.updateQualityEpisode(id, updates);
      res.json(updatedEpisode);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quality episode series" });
    }
  });

  // Delete a quality episode series
  app.delete("/api/quality-episodes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      await storage.deleteQualityEpisode(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quality episode series" });
    }
  });

  // Helper function to get client IP address
  const getClientIP = (req: any) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.ip || 
           'unknown';
  };

  // Redirect route for short URLs - handle single and quality movie links
  app.get("/m/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const clientIP = getClientIP(req);
      
      // Try to find the link in both single and quality movie links
      let movieLink = await storage.getMovieLinkByShortId(shortId);
      let qualityMovieLink = await storage.getQualityMovieLinkByShortId(shortId);
      let linkType = "single";
      
      // If not found in regular movie links, check quality movie links
      if (!movieLink && qualityMovieLink) {
        linkType = "quality";
      }
      
      if (!movieLink && !qualityMovieLink) {
        // For expired/missing links, redirect to redirect page with error parameter
        return res.redirect("/redirect?error=expired");
      }

      const link = movieLink || qualityMovieLink;
      if (!link) {
        return res.redirect("/redirect?error=expired");
      }

      // Check if this IP has seen ads for this shortId in the last 5 minutes
      const hasSeenAd = await storage.hasSeenAd(clientIP, shortId, linkType);

      const linkData: any = {
        movieName: (link as any).movie_name || link.movieName,
        shortId: (link as any).short_id || link.shortId,
        adsEnabled: (link as any).ads_enabled || link.adsEnabled,
        linkType,
        skipTimer: hasSeenAd // Skip timer if user has seen ad recently
      };

      if (linkType === "quality" && qualityMovieLink) {
        linkData.qualityLinks = {
          quality480p: (qualityMovieLink as any).quality_480p || (qualityMovieLink as any).quality480p,
          quality720p: (qualityMovieLink as any).quality_720p || (qualityMovieLink as any).quality720p,
          quality1080p: (qualityMovieLink as any).quality_1080p || (qualityMovieLink as any).quality1080p
        };
      } else if (movieLink) {
        linkData.originalLink = (movieLink as any).original_link || movieLink.originalLink;
      }

      // Encode link data as URL parameter
      const encodedLinkData = encodeURIComponent(JSON.stringify(linkData));
      res.redirect(`/redirect?link=${encodedLinkData}`);
    } catch (error) {
      console.error("Error in redirect route:", error);
      res.redirect("/redirect?error=expired");
    }
  });

  // Redirect route for quality episode series URLs (/e/)
  app.get("/e/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const clientIP = getClientIP(req);
      
      // Find the quality episode series
      let qualityEpisode = await storage.getQualityEpisodeByShortId(shortId);
      
      if (!qualityEpisode) {
        // For expired/missing episodes, redirect to redirect page with error parameter
        return res.redirect("/redirect?error=expired");
      }

      // Check if this IP has seen ads for this shortId in the last 5 minutes
      const hasSeenAd = await storage.hasSeenAd(clientIP, shortId, "episode");

      const linkData: any = {
        seriesName: (qualityEpisode as any).series_name || qualityEpisode.seriesName,
        shortId: (qualityEpisode as any).short_id || qualityEpisode.shortId,
        adsEnabled: (qualityEpisode as any).ads_enabled || qualityEpisode.adsEnabled,
        linkType: "episode",
        skipTimer: hasSeenAd, // Skip timer if user has seen ad recently
        startFromEpisode: (qualityEpisode as any).start_from_episode || qualityEpisode.startFromEpisode,
        episodes: JSON.parse((qualityEpisode as any).episodes || qualityEpisode.episodes)
      };

      // Encode link data as URL parameter
      const encodedLinkData = encodeURIComponent(JSON.stringify(linkData));
      res.redirect(`/redirect?link=${encodedLinkData}`);
    } catch (error) {
      console.error("Error in episode redirect route:", error);
      res.redirect("/redirect?error=expired");
    }
  });

  // API endpoint to record ad view (called when timer completes)
  app.post("/api/record-ad-view", async (req, res) => {
    try {
      const { shortId, linkType } = req.body;
      const clientIP = getClientIP(req);
      
      if (!shortId) {
        return res.status(400).json({ error: "Short ID is required" });
      }

      // Record that this IP has seen the ad for this shortId
      await storage.recordAdView(clientIP, shortId, linkType || 'single');
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error recording ad view:", error);
      res.status(500).json({ error: "Failed to record ad view" });
    }
  });

  // Cleanup expired sessions periodically (could be called by a cron job)
  app.post("/api/cleanup-expired-sessions", async (req, res) => {
    try {
      await storage.cleanupExpiredSessions();
      res.json({ success: true });
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      res.status(500).json({ error: "Failed to cleanup expired sessions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
