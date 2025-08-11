# MovieZone Deployment Guide

## Hostinger এ Deploy করার জন্য Steps:

### 1. File Preparation
```bash
# Download project files
- Copy all project files to your local machine
- env-config.js file এ আপনার actual values গুলো update করুন
```

### 2. Environment Configuration
```javascript
// env-config.js file এ নিচের values update করুন:
module.exports = {
  DATABASE_URL: "your_supabase_database_url",
  SUPABASE_URL: "your_supabase_project_url", 
  SUPABASE_ANON_KEY: "your_supabase_anon_key",
  NODE_ENV: "production",
  PORT: process.env.PORT || 5000,
  DEFAULT_API_TOKEN: "your_secure_api_token",
  JWT_SECRET: "your_jwt_secret_key",
  SESSION_SECRET: "your_session_secret",
  APP_DOMAIN: "yourdomain.com"
};
```

### 3. Hostinger Upload
1. **File Upload:** সব files Hostinger এ upload করুন
2. **Dependencies:** `npm install` command run করুন 
3. **Build:** `npm run build` (যদি build script থাকে)
4. **Start:** `npm run dev` অথবা `node server/index.js`

### 4. Domain Configuration
- আপনার domain env-config.js এ update করুন
- Hostinger এ proper port mapping setup করুন

### 5. Security Checklist
- ✅ env-config.js file secure রাখুন
- ✅ .gitignore এ env-config.js add করুন  
- ✅ Database credentials protect করুন
- ✅ API tokens strong রাখুন

### 6. Database Setup
- Supabase SQL Editor এ provided SQL code run করুন
- Tables এবং permissions setup verify করুন

### 7. Testing
- API endpoints test করুন
- Redirect functionality test করুন
- Admin panel access test করুন

## Important Notes:
- **env-config.js** file কখনও public করবেন না
- Database password change করলে env-config.js update করুন
- Production এ NODE_ENV=production set করুন