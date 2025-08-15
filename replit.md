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
  - **Universal API Implementation (2025-08-11)**: Added secure token-based API for any platform integration
    - Created Universal API endpoint that works with any external service (Telegram bots, Discord bots, websites, etc.)
    - API-created links always have ads enabled (cannot be disabled for security/revenue)
    - Admin panel links retain ads on/off toggle option
    - All links (API + Admin) appear in same database table with full edit capability
    - Implemented secure token authentication with Bearer token system
    - Enhanced database table display with Views column and copy buttons for short links
    - Updated API documentation for universal platform integration
  - **Security & Performance Improvements (2025-08-11)**: Enhanced admin panel security and user experience
    - Moved admin login credentials from hardcoded values to environment variables (env-config.js)
    - Fixed recent links section to display only last 5 created links instead of 10
    - Removed duplicate API endpoint for better code maintenance
    - Implemented proper today's statistics calculation for links and views
    - Added admin configuration API endpoint for secure credential management
  - **Replit Migration & Supabase Integration (2025-08-12)**: Migrated project from Replit Agent to standard Replit
    - Successfully migrated from memory storage to Supabase PostgreSQL database
    - Implemented Supabase REST API client to bypass network restrictions
    - All movie links and API tokens now stored permanently in Supabase
    - Database connection established via REST API instead of direct PostgreSQL connection
    - Maintained full functionality while ensuring data persistence in Supabase
    - Fixed console errors in AdminPanel component with proper null checking
    - Enhanced error handling in Supabase client for better reliability
    - All data operations now working correctly with Supabase backend
  - **Complete Supabase Migration & Admin Management (2025-08-12)**: Removed all local memory storage
    - Completely removed MemStorage class - using only Supabase DatabaseStorage
    - Added admin_settings table in Supabase for dynamic login credentials management
    - Admin credentials now stored in and fetched from Supabase database
    - Created Settings tab in admin panel for updating admin credentials in real-time
    - API token management with full edit/delete functionality via Supabase
    - Enhanced API token status toggle (active/inactive) with conditional delete permissions
    - All application data now 100% stored in Supabase with no local memory dependencies
  - **Enhanced Edit Functionality & API Documentation (2025-08-15)**: Fixed quality links editing and improved API instructions
    - Fixed quality links edit dialog to properly display existing quality links (480p, 720p, 1080p) in input fields
    - Enhanced field name compatibility for both camelCase and snake_case data formats
    - Added tabbed API instructions section with separate tabs for Single Links API and Quality Links API
    - Quality Links API tab shows proper endpoint (/api/create-quality-short-link) with complete documentation
    - Both API instruction tabs include proper authentication headers and request/response examples
    - Fixed quality link editing to properly remove empty quality fields from database
    - Enhanced Available Qualities column display with dynamic quality badge showing
  - **5-Minute Timer Skip System (2025-08-15)**: Implemented IP-based timer skip to improve user experience
    - Added ad_view_sessions table to track IP addresses that have seen ads for specific links
    - Users who complete the 10-second timer won't see it again for 5 minutes on the same link from same IP
    - Prevents duplicate view counting when users return to same link within 5 minutes
    - Improves user experience by not forcing repeated ad viewing for quality link browsing
    - Works for both single and quality movie links with automatic cleanup of expired sessions
    - IP-based tracking ensures fair ad viewing while allowing quality link exploration
  - **Replit Agent to Replit Migration (2025-08-13)**: Successfully migrated project to standard Replit environment
    - Removed all hardcoded admin credentials from server code and environment files
    - Admin login now exclusively managed through Supabase admin_settings table
    - Fixed API response formatting to handle Supabase field naming (snake_case to camelCase)
    - Verified all existing Supabase data loads correctly (3 sample movie links confirmed)
    - Enhanced error handling and debugging for admin settings retrieval
    - Project now runs cleanly in Replit with proper client/server separation and security practices
    - **Final Security Enhancements (2025-08-13)**: Completed admin panel security improvements
      - Removed admin credentials update functionality from Settings tab (now Supabase-only)
      - Fixed API token status toggle bug in DatabaseStorage class
      - Settings tab now displays informational message about Supabase credential management
      - All admin credential changes must be done directly in Supabase dashboard for enhanced security
  - **Complete Supabase Service Role Integration (2025-08-13)**: Resolved all RLS and permission issues
    - Added SUPABASE_SERVICE_ROLE_KEY to environment configuration for write operations
    - Completely removed hybrid/memory storage - now using 100% Supabase DatabaseStorage
    - Fixed all API token CRUD operations (Create, Read, Update, Delete) with proper Supabase integration
    - All token management now persists directly to Supabase database with proper permissions
    - Enhanced delete method in Supabase client for complete token lifecycle management
    - Verified full functionality: token generation, status updates, deletion all working correctly
  - **Replit Agent to Standard Replit Migration (2025-08-14)**: Successfully migrated MovieZone project to standard Replit
    - Migrated from Replit Agent environment to standard Replit with proper client/server separation
    - Enhanced project architecture with dual-tab interface for Single and Quality movie links
    - Implemented quality-based movie link system alongside existing single link functionality
    - Updated AdminPanel with dual tabs in both Home (link creation) and Database (data management) sections
    - Quality links support multiple video qualities (480p, 720p, 1080p) with single short URL generation
    - Enhanced RedirectPage to handle both single and quality movie links with proper URL parameter parsing
    - Updated database storage layer with comprehensive CRUD operations for quality movie links
    - Added comprehensive API routes for quality movie link management (/api/quality-movie-links)
    - Implemented proper stats calculation combining both single and quality links
    - Enhanced Recent Links section with link type indicators (Single/Quality badges)
    - Database section now features separate tabs for Single Links and Quality Links management
    - All existing functionality preserved while adding extensive quality-based link capabilities
    - Project successfully runs in standard Replit environment with complete feature parity

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