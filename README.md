# MovieZone Admin Panel

A secure movie link shortening service with Universal API integration for multiple platforms.

## 🚀 Features

- **Universal API** - Works with Telegram bots, Discord bots, websites, and any external service
- **Secure Authentication** - Token-based API authentication system
- **Admin Panel** - Complete link management interface
- **Redirect System** - 10-second countdown with ads integration
- **Database Management** - PostgreSQL with Supabase integration

## 📁 Project Structure

```
├── server/           # Backend Express.js server
│   ├── .env.example  # Environment template
│   └── .env         # Your Supabase credentials (create from .env.example)
├── client/           # Frontend React application  
├── shared/           # Shared TypeScript schemas
└── DEPLOYMENT_GUIDE.md
```

## 🔧 Setup Instructions

### For Replit (Recommended)
1. **Import from GitHub**: Import this repository to Replit
2. **Set Replit Secrets** (Preferred): Add environment variables in Replit Secrets:
   - `DATABASE_URL`: Your Supabase database URL
   - `SUPABASE_URL`: Your Supabase project URL  
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
3. **Alternative**: Copy `server/.env.example` to `server/.env` and add your credentials
4. **Auto-start**: Application starts automatically on port 5000 after credentials are set
5. **Dependencies**: All packages are pre-configured in package.json

### For Local Development
1. **Environment Configuration**: Update `server/.env` with your credentials:
```env
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

2. **Database Setup**: Run the SQL schema from `SUPABASE_SQL_SCHEMA.sql` in your Supabase SQL Editor

3. **Start Application**:
```bash
npm install
npm run dev
```

### Production Deployment
```bash
npm run build
npm run start
```

## 🔐 Security Features

- **Environment Protection** - Credentials via Replit Secrets or `server/.env` (never committed)
- **Server-side Auth** - Plain text admin verification (no client-side password exposure)  
- **Token Authentication** - Secure Bearer token system for API access
- **Database Security** - Supabase RLS policies enabled
- **Input Validation** - Zod schema validation throughout
- **Key Rotation** - Always use your own Supabase project and rotate keys if importing from public repo

## 📖 API Documentation

See `API_DOCUMENTATION.md` for complete integration examples.

## 🌐 Deployment

See `DEPLOYMENT_GUIDE.md` for Hostinger and other hosting platforms.

## ⚡ Universal API Usage

```bash
curl -X POST your-domain.com/api/create-short-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{"movieName": "Movie Title", "originalLink": "https://download-link"}'
```

**Note:** API-created links always have ads enabled for revenue protection.