import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMovieLinkSchema, createShortLinkSchema } from "@shared/schema";
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
  
  // Admin configuration endpoint
  app.get("/api/admin-config", async (req, res) => {
    try {
      const adminId = process.env.ADMIN_ID || envConfig.ADMIN_ID || "sbiswas1844";
      const adminPassword = process.env.ADMIN_PASSWORD || envConfig.ADMIN_PASSWORD || "save@184455";
      
      res.json({
        adminId,
        adminPassword
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to load admin configuration" });
    }
  });
  
  // Universal API endpoint for creating short links (for any external service)
  app.post("/api/create-short-link", authenticateToken, async (req, res) => {
    try {
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

  // Update movie link original URL
  app.patch("/api/movie-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const { originalLink } = req.body;
      if (!originalLink || typeof originalLink !== "string") {
        return res.status(400).json({ error: "Original link is required" });
      }
      
      const updatedLink = await storage.updateMovieLinkOriginalUrl(id, originalLink);
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
      const { tokenName } = req.body;
      
      if (!tokenName || typeof tokenName !== "string") {
        return res.status(400).json({ error: "Token name is required" });
      }
      
      // Generate secure token
      const tokenValue = crypto.randomBytes(32).toString('hex');
      
      const apiToken = await storage.createApiToken({
        tokenName,
        tokenValue,
        isActive: true,
      });
      
      res.status(201).json(apiToken);
    } catch (error) {
      console.error("Error creating API token:", error);
      res.status(500).json({ error: "Failed to create API token" });
    }
  });

  app.delete("/api/tokens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid token ID" });
      }
      
      await storage.deactivateApiToken(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to deactivate token" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
