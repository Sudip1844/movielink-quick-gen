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
  - Fixed toast notifications to display for only 1 second
  - Redesigned redirect page with beautiful MovieZone branding
  - Added persistent PostgreSQL database storage (DatabaseStorage)
  - Enhanced redirect page with additional movie-related content sections
  - **Redirect Page Optimization (2025-01-29)**: Major improvements to match design specifications
    - Changed timer from 15 seconds to single 10-second countdown
    - Movie name now displays above timer during countdown, hidden after completion
    - Continue section only appears after timer completion (no premature visibility)
    - Removed duplicate timer displays and unnecessary delay counters
    - Fixed random view count increases by implementing proper view tracking
    - Reduced font sizes across all content sections for better readability
    - Removed "Go to Home" option for expired/missing links - users stay on redirect page
    - Manual scroll to continue button instead of automatic scrolling
    - Changed continue button text from "Continue to Bot" to simply "Continue"
  - **Admin Panel Enhancements (2025-01-29)**: Improved admin interface and functionality
    - Reorganized stats display in 2x2 grid: Total Links | Today's Links | Total Views | Today's Views
    - Added Recent Links section below link generator showing last 10 created links with copy buttons
    - Fixed generated link clearing after copying to prevent permanent display
    - Generated links now move to recent links section after copying

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
- `POST /api/create-short-link` - API endpoint to create short links (Input: movieName, originalLink | Output: shortUrl)
- `GET /api/movie-links/:shortId` - Get specific movie link by short ID
- `PATCH /api/movie-links/:shortId/views` - Update view count
- `PATCH /api/movie-links/:id` - Update movie link original URL
- `DELETE /api/movie-links/:id` - Delete movie link

## User Preferences
- Use TypeScript for all new code
- Prefer in-memory storage unless specifically asked for database persistence
- Follow modern React patterns with hooks and functional components
- Use wouter for routing instead of React Router