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
├── client/           # Frontend React application  
├── shared/           # Shared TypeScript schemas
├── env-config.js     # Environment configuration (keep secure!)
└── DEPLOYMENT_GUIDE.md
```

## 🔧 Setup Instructions

### 1. Environment Configuration
Copy your credentials to `env-config.js`:
```javascript
module.exports = {
  DATABASE_URL: "your_supabase_database_url",
  SUPABASE_URL: "your_supabase_project_url",
  SUPABASE_ANON_KEY: "your_supabase_anon_key",
  DEFAULT_API_TOKEN: "your_secure_api_token"
};
```

### 2. Database Setup
Run the provided SQL schema in your Supabase SQL Editor.

### 3. Start Application
```bash
npm install
npm run dev
```

## 🔐 Security Features

- **Environment Protection** - All sensitive data in `env-config.js`
- **Token Authentication** - Secure Bearer token system
- **Database Security** - Row Level Security (RLS) enabled
- **Input Validation** - Zod schema validation

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