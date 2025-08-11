#!/usr/bin/env node

/**
 * Production Build Script for MovieZone
 * This script creates a complete production build with all necessary files
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting MovieZone Production Build...');

// Create production directory
const prodDir = 'moviezone-production';
if (fs.existsSync(prodDir)) {
  fs.rmSync(prodDir, { recursive: true });
}
fs.mkdirSync(prodDir);

console.log('📦 Building application...');

try {
  // Build the application
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('📋 Copying files...');
  
  // Copy essential files
  const filesToCopy = [
    'env-config.js',
    'package.json',
    'package-lock.json',
    'API_DOCUMENTATION.md',
    'DEPLOYMENT_GUIDE.md',
    'README.md',
    'SUPABASE_SQL_SCHEMA.sql'
  ];
  
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(prodDir, file));
      console.log(`✅ Copied ${file}`);
    }
  });
  
  // Copy built application
  if (fs.existsSync('dist')) {
    fs.cpSync('dist', path.join(prodDir, 'dist'), { recursive: true });
    console.log('✅ Copied dist folder');
  }
  
  // Copy shared folder
  if (fs.existsSync('shared')) {
    fs.cpSync('shared', path.join(prodDir, 'shared'), { recursive: true });
    console.log('✅ Copied shared folder');
  }
  
  // Copy server folder (for production deployment)
  if (fs.existsSync('server')) {
    fs.cpSync('server', path.join(prodDir, 'server'), { recursive: true });
    console.log('✅ Copied server folder');
  }
  
  // Copy client folder (built version)
  if (fs.existsSync('client')) {
    fs.cpSync('client', path.join(prodDir, 'client'), { recursive: true });
    console.log('✅ Copied client folder');
  }
  
  // Create production package.json with only production dependencies
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const prodPackage = {
    name: packageJson.name,
    version: packageJson.version,
    type: packageJson.type,
    license: packageJson.license,
    scripts: {
      start: "NODE_ENV=production tsx server/index.ts",
      "start:prod": "NODE_ENV=production node dist/index.js"
    },
    dependencies: packageJson.dependencies
  };
  
  fs.writeFileSync(
    path.join(prodDir, 'package.json'), 
    JSON.stringify(prodPackage, null, 2)
  );
  
  // Create deployment instructions
  const deploymentInstructions = `
# MovieZone Production Deployment

## Files included:
- env-config.js (UPDATE YOUR CREDENTIALS!)
- All built application files
- Documentation and SQL schema

## Deployment Steps:

1. Upload all files to your hosting platform
2. Update env-config.js with your actual credentials
3. Run: npm install --production
4. Start: npm start

## Important:
- Keep env-config.js secure
- Update database credentials in env-config.js
- Run SQL schema in your Supabase project
`;

  fs.writeFileSync(path.join(prodDir, 'DEPLOYMENT.txt'), deploymentInstructions);
  
  console.log(`
🎉 Production build completed!
📁 Files ready in: ${prodDir}/

📋 Next steps:
1. Update env-config.js with your actual credentials
2. Upload ${prodDir} folder to your hosting platform
3. Run 'npm install' on the server
4. Start with 'npm start'

⚠️  Important: Keep env-config.js secure!
  `);
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}