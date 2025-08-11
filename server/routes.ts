import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMovieLinkSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Movie Links API routes
  
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

  // API endpoint for creating movie link and returning short URL
  app.post("/api/create-short-link", async (req, res) => {
    try {
      const { movieName, originalLink, adsEnabled = true } = req.body;
      
      // Validate input
      if (!movieName || typeof movieName !== "string" || !movieName.trim()) {
        return res.status(400).json({ error: "Movie name is required" });
      }
      
      if (!originalLink || typeof originalLink !== "string" || !originalLink.trim()) {
        return res.status(400).json({ error: "Original link is required" });
      }
      
      // Generate unique short ID
      const generateShortId = () => {
        return Math.random().toString(36).substring(2, 8);
      };
      
      const shortId = generateShortId();
      
      // Create movie link
      const movieLink = await storage.createMovieLink({
        movieName: movieName.trim(),
        originalLink: originalLink.trim(),
        shortId,
        adsEnabled: Boolean(adsEnabled),
      });
      
      // Return the short URL
      const shortUrl = `${req.protocol}://${req.get('host')}/m/${shortId}`;
      
      res.status(201).json({
        success: true,
        shortUrl,
        shortId,
        movieName: movieLink.movieName,
        originalLink: movieLink.originalLink,
        adsEnabled: movieLink.adsEnabled
      });
      
    } catch (error) {
      res.status(500).json({ error: "Failed to create short link" });
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

  const httpServer = createServer(app);

  return httpServer;
}
