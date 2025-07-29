import { movieLinks, type MovieLink, type InsertMovieLink } from "@shared/schema";

// Storage interface for movie links
export interface IStorage {
  createMovieLink(movieLink: InsertMovieLink): Promise<MovieLink>;
  getMovieLinks(): Promise<MovieLink[]>;
  getMovieLinkByShortId(shortId: string): Promise<MovieLink | undefined>;
  updateMovieLinkViews(shortId: string): Promise<void>;
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

  async deleteMovieLink(id: number): Promise<void> {
    this.movieLinks.delete(id);
  }
}

export const storage = new MemStorage();
