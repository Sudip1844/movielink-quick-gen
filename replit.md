# MovieZone Admin Panel

## Overview
A movie link shortening service that allows admins to create short links for movie downloads with optional ad displays. The application consists of an admin panel for link management and a redirect page that handles the short URLs.

## Recent Changes
- **Migration from Lovable to Replit (2025-01-29)**: Migrated the project from Lovable platform to Replit
  - Replaced React Router with Wouter for routing
  - Migrated from Supabase to Replit's PostgreSQL database with Drizzle ORM
  - Moved client-side localStorage logic to server-side API endpoints
  - Implemented proper client/server separation for security
  - Updated all components to use @tanstack/react-query for API calls

## Project Architecture
- **Frontend**: React with TypeScript, Wouter for routing, TanStack Query for state management
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components

### Database Schema
- `movie_links` table with fields: id, movieName, originalLink, shortId, views, dateAdded, adsEnabled

### API Endpoints
- `GET /api/movie-links` - Fetch all movie links
- `POST /api/movie-links` - Create new movie link
- `GET /api/movie-links/:shortId` - Get specific movie link by short ID
- `PATCH /api/movie-links/:shortId/views` - Update view count
- `DELETE /api/movie-links/:id` - Delete movie link

## User Preferences
- Use TypeScript for all new code
- Prefer in-memory storage unless specifically asked for database persistence
- Follow modern React patterns with hooks and functional components
- Use wouter for routing instead of React Router