import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Load environment configuration synchronously
function loadEnvConfig() {
  try {
    // Try to load env-config.js dynamically
    return require('../env-config.js');
  } catch (error) {
    console.log('env-config.js not found, using environment variables');
    return {};
  }
}

const envConfig = loadEnvConfig();

// Replit PostgreSQL connection string
const connectionString = process.env.DATABASE_URL || envConfig.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Check environment variables.",
  );
}

// For Replit database, we don't need SSL in development
const client = postgres(connectionString, { 
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: 1 
});
export const db = drizzle(client, { schema });
